const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true
  },
  email: {
      type: String,
      required: true,
      unique: true
  },
  rollnumber: {
      type: String,
      required: true,
      unique: true
  },
  role: {
      type: String,
      required: true,
      enum: ['student', 'staff', 'admin']
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;