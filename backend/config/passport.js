const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    // try to find by googleId or email
    let user = await User.findOne({ googleId: profile.id }) || await User.findOne({ email });
    if (!user) {
      user = new User({
        name: profile.displayName || 'No name',
        email,
        googleId: profile.id
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = profile.id;
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));
