const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: String,
  password: String,
  googleID: String,
  fullName: String,
  phone: String,
  instruments: String,
  top3artists: String,
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
