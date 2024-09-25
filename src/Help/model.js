const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const HelpMaterialSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add an auto-incrementing id field
HelpMaterialSchema.plugin(AutoIncrement, { inc_field: 'id' });

const HelpMaterial = mongoose.model('HelpMaterial', HelpMaterialSchema);

module.exports = HelpMaterial;
