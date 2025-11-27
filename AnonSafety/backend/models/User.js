const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  region:   { type: String, default: 'Nairobi' },
  role:     { type: String, default: 'user' }, 
  // Opt-in for email alerts
  emailNotifications: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);