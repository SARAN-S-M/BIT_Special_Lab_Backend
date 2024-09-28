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
      enum: ['student', 'faculty', 'admin', 'mentor'], // Example roles, adjust as needed
      default: 'student' // You can set a default role here if needed
    },
    status: {
        type: Boolean,
        default: true
    },
    specialLab: {
        type: String,
        default: null // Default value is set to null
    },
    specialLabCode: {
        type: String,
        default: null
    },
    InterviewProgress: {
        type: String,
        enum: [null, "Slot Booked", "Accepted", "Rejected", "Absent", "Mentor Approved", "Mentor Rejected", "Faculty Scheduled"],
        default: null
    },
  });

const User = mongoose.model('User', userSchema);

module.exports = User;