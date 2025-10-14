require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// ensure DB is connected via connectDB helper
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// passport google strategy
require('./config/passport');
// initialize passport middleware
app.use(passport.initialize());

// routes - filenames in this repo are auths.js and users.js
app.use('/api/auth', require('./routes/auths'));
app.use('/api/users', require('./routes/users'));

// google oauth routes (starts passport flow and handles callback)
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    // On success, generate JWT and redirect to frontend with token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const redirectUrl = `${process.env.CLIENT_URL}/oauth2/redirect?token=${token}`;
    res.redirect(redirectUrl);
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
