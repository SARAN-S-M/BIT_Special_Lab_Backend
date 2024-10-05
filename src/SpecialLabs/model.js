const mongoose = require('mongoose');

// Define the Slot schema
const slotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    fromTime: {
        type: Date,
        required: true,
    },
    toTime: {
        type: Date,
        required: true,
    },
    totalStudents: {
        type: Number,
        required: true,
    },
    students: [
        {
            studentName: {
                type: String,
                required: true,
            },
            studentEmail: {
                type: String,
                required: true,
            },
            rollNumber: {
                type: String,
                required: true,
            },
        }
    ]
});

// Define the Special Lab schema
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
        type: String,
        default: null
    },
    slots: [slotSchema]
});

// Create the model
const SpecialLab = mongoose.model('SpecialLab', specialLabSchema);

module.exports = SpecialLab;
