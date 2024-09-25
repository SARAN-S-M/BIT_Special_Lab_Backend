const SpecialLab = require('./model');
require('dotenv').config();

exports.addSpecialLab = async (req, res) => {
    try {
        const { specialLabName, specialLabCode } = req.body;

        let existingSpecialLab = await SpecialLab.findOne({ specialLabCode });

        if (existingSpecialLab) {
            return res.status(200).json({ error: 'Special Lab already exists.' });
        }

        const specialLab = new SpecialLab({
            specialLabName,
            specialLabCode
        });

        await specialLab.save();

        res.status(201).json({ message: 'Special Lab added successfully', specialLab });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};