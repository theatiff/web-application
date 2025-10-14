const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // absent for Google users
  phone: { type: String },
  age: { type: Number },
  fatherNumber: { type: String },
  googleId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
