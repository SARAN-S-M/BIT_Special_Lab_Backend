const Help = require('./model.js');
require('dotenv').config();

exports.getHelpMaterials = async (req, res) => {
    try {
        const helpMaterials = await Help.find().select('id question answer');
        res.status(200).json(helpMaterials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.addHelpMaterial = async (req, res) => {
    console.log('addHelpMaterial');
    try {
        const { question, answer } = req.body;

        const helpMaterial = new Help({
            question,
            answer
        });

        await helpMaterial.save();

        // If using mongoose-sequence, the 'id' should be available after save
        res.status(201).json({ 
            message: 'Help Material added successfully', 
            helpMaterial: {
                id: helpMaterial.id, // Ensure this is correct
                question: helpMaterial.question,
                answer: helpMaterial.answer
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



exports.removeHelpMaterial = async (req, res) => {
    console.log('removeHelpMaterial');
    try {
        const { id } = req.body;

        console.log('id', id);

        let existingHelpMaterial = await Help.findById(id);

        if (!existingHelpMaterial) {
            return res.status(404).json({ error: 'Help Material does not exist.' });
        }

        await Help.deleteOne({ _id: id });

        res.status(200).json({ message: 'Help Material removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}