const SpecialLab = require('./model');
const User = require('../User/model');
require('dotenv').config();
const { hashId } = require('../../util/cryptoUtils');

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

exports.getLabsNames = async (req, res) => {
    // console.log('getLabsNames');
    try {
        // Fetch special labs' names and codes
        let specialLabs = await SpecialLab.find({}, { specialLabName: 1, specialLabCode: 1 });

        // Secret key from environment variables
        const secretKey = process.env.SECRET_KEY;

        // console.log(secretKey);

        // Hash the _id and map results
        let labsWithHashedId = specialLabs.map(lab => {
            return {
                specialLabName: lab.specialLabName,
                specialLabCode: lab.specialLabCode,
                hashedId: hashId(lab._id, secretKey)  // hash the _id using the imported function
            };
        });

        res.status(200).json({ labs: labsWithHashedId });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getLabDetailsById = async (req, res) => {
    console.log('getLabDetailsById');
    try {
        // Extract the hashed ID from the request
        const hashedId = req.params.id;
        const secretKey = process.env.SECRET_KEY;

        // Fetch all labs and find the one with the matching hash
        let specialLabs = await SpecialLab.find();
        const lab = specialLabs.find(lab => hashId(lab._id, secretKey) === hashedId);

        if (!lab) {
            return res.status(404).json({ error: 'Lab not found' });
        }

        // console.log(lab);
        // map the lab destils with correct name as key before sending it to the client
        labDetails = {
            SpecialLabName: lab.specialLabName,
            SpecialLabCode: lab.specialLabCode,
            SpecialLabDescription: lab.specialLabDescription,
            faculties: lab.faculties.map(faculty => ({
                facultyName: faculty.facultyName,
                facultyEmail: faculty.facultyEmail
            })),
            promoVideoUrl: lab.promoVideo
        };
        console.log(labDetails);
        // Send the lab details
        res.status(200).json({ labDetails });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.FacultyGetLabDetails = async (req, res) => {
    try {
        // console.log("user eamil",req.userEmail);
        // console.log(req.headers);
        const facultyEmail = req.userEmail;
        // console.log(facultyEmail);

        let faculty = await User.findOne({ email: facultyEmail });

        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found.' });
        }

        if (faculty.role !== 'faculty') {
            return res.status(200).json({ error: 'User is not a faculty.' });
        }

        // console.log(facultyEmail);

        let specialLabs = await SpecialLab.find({ 'faculties.facultyEmail': facultyEmail });

        // console.log('specialLabs', specialLabs);

        if (!specialLabs) {
            return res.status(200).json({ error: 'No Special Labs found.' });
        }

        let labDetails = specialLabs.map(lab => {
            return {
                specialLabName: lab.specialLabName,
                specialLabCode: lab.specialLabCode,
                specialLabDescription: lab.specialLabDescription,
                faculties: lab.faculties.map(faculty => ({
                    facultyName: faculty.facultyName,
                    facultyEmail: faculty.facultyEmail
                })),
                promoVideoUrl: lab.promoVideo
            };
        });
        labDetails = labDetails[0];
        res.status(200).json({ labDetails });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}