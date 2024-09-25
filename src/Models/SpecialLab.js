//write the mongoose schema for the SpecialLab model
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpecialLabSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    rollnumber: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('SpecialLab', SpecialLabSchema);