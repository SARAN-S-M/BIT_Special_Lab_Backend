const mongoose = require('mongoose');

const specialLabSchema = new mongoose.Schema({
  specialLabName: {
    type: String,
    required: true
  },
  specialLabCode: {
    type: String,
    required: true,
    unique: true
  },
  specialLabDescription: {
    type: String,
    default: null
  },
  faculties: [{
    facultyName: {
      type: String,
      required: true
    },
    facultyEmail: {
      type: String,
      required: true
    }
  }],
  promoVideo: {
    type: String, // URL of the promotional video
    default: null
  }
});

const SpecialLab = mongoose.model('SpecialLab', specialLabSchema);

module.exports = SpecialLab;