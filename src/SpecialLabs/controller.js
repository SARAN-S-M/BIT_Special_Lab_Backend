const SpecialLab = require('./model');
const User = require('../User/model');
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

exports.removeSpecialLab = async (req, res) => {
    // console.log('removeSpecialLab');
    try {
        const { specialLabCode } = req.body;

        let existingSpecialLab = await SpecialLab.findOne({ specialLabCode });

        if (!existingSpecialLab) {
            return res.status(201).json({ error: 'Special Lab does not exist.' });
        }

        // console.log('existingSpecialLab', existingSpecialLab);

        await SpecialLab.deleteOne({ specialLabCode });

        res.status(200).json({ message: 'Special Lab removed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.addFaculty = async (req, res) => {
    try {
        const { facultyEmail } = req.body;

        let faculty = await User.findOne({ email: facultyEmail });

        if (!faculty) {
            return res.status(200).json({ error: 'Faculty does not exist.' });
        }

        if (faculty.role !== 'faculty') {
            return res.status(200).json({ error: 'User is not a faculty.' });
        }

        const { specialLabCode } = req.body;

        let existingSpecialLab = await SpecialLab.findOne({ specialLabCode });

        // console.log('existingSpecialLab', existingSpecialLab);
        // console.log(facultyEmail);

        if (!existingSpecialLab) {
            return res.status(200).json({ error: 'Special Lab does not exist.' });
        }

        // console.log("Hello..1");
        existingSpecialLab.faculties.push({ facultyName : faculty.name, facultyEmail : facultyEmail });
        // existingSpecialLab.faculties.push({ facultyName: "John Doe", facultyEmail: "john.doe@example.com" });
        // console.log("Hello..2");

        // console.log(facultyEmail, faculty.name);

        await existingSpecialLab.save();

        // console.log("Hello..3");

        res.status(201).json({ message: 'Faculty added successfully', specialLab: existingSpecialLab });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.removeFaculty = async (req, res) => {
    try {
        const { specialLabCode, facultyEmail } = req.body;

        let existingSpecialLab = await SpecialLab.findOne({ specialLabCode });

        // console.log('existingSpecialLab', existingSpecialLab);

        if (!existingSpecialLab) {
            return res.status(200).json({ error: 'Special Lab does not exist.' });
        }

        let facultyIndex = existingSpecialLab.faculties.findIndex(faculty => faculty.facultyEmail === facultyEmail);

        // console.log('facultyIndex', facultyIndex);

        if (facultyIndex === -1) {
            return res.status(200).json({ error: 'Faculty does not exist.' });
        }

        existingSpecialLab.faculties.splice(facultyIndex, 1);

        await existingSpecialLab.save();

        res.status(200).json({ message: 'Faculty removed successfully', specialLab: existingSpecialLab });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}