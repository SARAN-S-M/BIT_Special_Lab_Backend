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
    console.log('removeSpecialLab');
    try {
        const { specialLabCode } = req.body;

        console.log("Hello")

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
        const { facultyEmail, specialLabCode } = req.body;

        let faculty = await User.findOne({ email: facultyEmail });

        if (!faculty) {
            return res.status(200).json({ error: 'Faculty does not exist.' });
        }

        if (faculty.role !== 'faculty') {
            return res.status(200).json({ error: 'User is not a faculty.' });
        }

        // Check if the faculty is already associated with any special lab
        // if (faculty.specialLabCode) {
        //     // Remove the faculty from the current special lab
        //     await exports.removeFaculty({ body: { specialLabCode: faculty.specialLabCode, facultyEmail } }, res);
        // }

        let existingSpecialLab = await SpecialLab.findOne({ specialLabCode });

        if (!existingSpecialLab) {
            return res.status(200).json({ error: 'Special Lab does not exist.' });
        }

        existingSpecialLab.faculties.push({ facultyName: faculty.name, facultyEmail: facultyEmail });

        await existingSpecialLab.save();

        faculty.specialLab = existingSpecialLab.specialLabName;
        faculty.specialLabCode = existingSpecialLab.specialLabCode;

        await faculty.save();

        res.status(201).json({ message: 'Faculty added successfully', specialLab: existingSpecialLab });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.removeFaculty = async (req, res) => {
    try {
        const { specialLabCode, facultyEmail } = req.body;

        let existingSpecialLab = await SpecialLab.findOne({ specialLabCode });

        if (!existingSpecialLab) {
            return res.status(200).json({ error: 'Special Lab does not exist.' });
        }

        let facultyIndex = existingSpecialLab.faculties.findIndex(faculty => faculty.facultyEmail === facultyEmail);

        if (facultyIndex === -1) {
            return res.status(200).json({ error: 'Faculty does not exist.' });
        }

        existingSpecialLab.faculties.splice(facultyIndex, 1);

        await existingSpecialLab.save();

        //remove the specialLab name and code from the faculty
        let faculty = await User.findOne({ email: facultyEmail });
        faculty.specialLab = null;
        faculty.specialLabCode = null;
        await faculty.save();

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
        res.status(200).json({ labDetails });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.FacultyGetLabDetails = async (req, res) => {
    try {
        const facultyEmail = req.userEmail;
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

exports.FacultyUpdateLabDetails = async (req, res) => {
    try {
        const facultyEmail = req.userEmail;

        const { newDescription, newPromoVideo } = req.body;

        let existingSpecialLab = await SpecialLab.findOne({
            'faculties.facultyEmail': facultyEmail
        });

        console.log('existingSpecialLab', existingSpecialLab);

        if (!existingSpecialLab) {
            return res.status(200).json({ error: 'Faculty does not have access to this Special Lab.' });
        }

        existingSpecialLab.specialLabDescription = newDescription;
        existingSpecialLab.promoVideo = newPromoVideo;

        await existingSpecialLab.save();

        console.log('existingSpecialLab', existingSpecialLab);


        // res.status(200).json({ message: 'Special Lab details updated successfully', specialLab: existingSpecialLab });
        res.status(200).json({ message: 'Special Lab details updated successfully'});

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.addSlot = async (req, res) => {
    console.log('addSlot');
    try {
        const { date, fromTime, toTime, totalStudents } = req.body;

        const fromDateTime = new Date(`${date}T${fromTime}:00`);
        const toDateTime = new Date(`${date}T${toTime}:00`);

        console.log("fromDateTime");

        // special lab code is need to fetched from the faculty so took the faculty email and with that fetched the special lab code
        const facultyEmail = req.userEmail;
        let faculty = await User.findOne({ email: facultyEmail });

        if (!faculty) {
            return res.status(200).json({ error: 'Faculty does not exist.' });
        }

        let specialLabCode = faculty.specialLabCode;

        let existingSpecialLab = await SpecialLab.findOne({ specialLabCode });

        if (!existingSpecialLab) {
            return res.status(200).json({ error: 'Special Lab does not exist.' });
        }

        const slot = {
            date: new Date(date),  // Store the date as a Date object
            fromTime: fromDateTime,  // Store as Date object for better time handling
            toTime: toDateTime,
            totalStudents: totalStudents,
            students: []  // Initialize with an empty array
        };

        existingSpecialLab.slots.push(slot);

        await existingSpecialLab.save();

        console.log('Slot added successfully');

        res.status(201).json({ message: 'Slot added successfully', slot });
    } catch (error) {
        console.log("error");
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getSlots = async (req, res) => {
    try {
        const facultyEmail = req.userEmail;
        let faculty = await User.findOne({ email: facultyEmail });

        if (!faculty) {
            return res.status(200).json({ error: 'Faculty does not exist.' });
        }

        let specialLabCode = faculty.specialLabCode;

        let existingSpecialLab = await SpecialLab.findOne({
            specialLabCode
        });

        if (!existingSpecialLab) {
            return res.status(200).json({ error: 'Special Lab does not exist.' });
        }

        let slots = existingSpecialLab.slots;

        // donot sent the slots as it it, as it has the _id object so hash that and sent it
        slots = slots.map(slot => {
            return {
                date: slot.date,
                fromTime: slot.fromTime,
                toTime: slot.toTime,
                totalStudents: slot.totalStudents,
                hashedId: hashId(slot._id, process.env.SECRET_KEY)
            };
        });

        res.status(200).json({ slots: slots });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// write the delete slot route where the hasedId will be the passed in the body
exports.deleteSlot = async (req, res) => {
    try {
        const { hashedId } = req.body;
        const secretKey = process.env.SECRET_KEY;

        // Fetch all labs and find the slot with the matching hash
        let specialLabs = await SpecialLab.find();
        let slotFound = false;

        for (let lab of specialLabs) {
            const slotIndex = lab.slots.findIndex(slot => hashId(slot._id, secretKey) === hashedId);

            if (slotIndex !== -1) {
                // Check if the slot has any students
                if (lab.slots[slotIndex].students.length > 0) {
                    return res.status(400).json({ error: 'Some students are pending in this slot.' });
                }

                lab.slots.splice(slotIndex, 1);
                await lab.save();
                slotFound = true;
                break;
            }
        }

        if (!slotFound) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        res.status(200).json({ message: 'Slot deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// dehash the :id to get the special lab code with that search the special lab and get the slots array and return it
exports.getSlotsByLabId = async (req, res) => {
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

        let slots = lab.slots;

        slots = slots.map(slot => {
            return {
                date: slot.date,
                fromTime: slot.fromTime,
                toTime: slot.toTime,
                totalStudents: slot.totalStudents,
                hashedId: hashId(slot._id, process.env.SECRET_KEY)
            };
        });

        res.status(200).json({ slots: slots });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.bookSlot = async (req, res) => {
    try {
        const hashedLabCode = req.params.id;
        const studentEmail = req.userEmail;
        const { hashedIdSlotId } = req.body;
        const secretKey = process.env.SECRET_KEY;

        // Dehash the lab code to find the special lab
        let specialLabs = await SpecialLab.find();
        const lab = specialLabs.find(lab => hashId(lab._id, secretKey) === hashedLabCode);

        if (!lab) {
            return res.status(404).json({ error: 'Lab not found' });
        }

        // console.log(lab.slots[0]._id);
        console.log("hash 1", hashId(lab.slots[0]._id, secretKey));
        console.log("hash 2", hashedIdSlotId)


        // Find the slot with the matching hash
        const slotIndex = lab.slots.findIndex(slot => hashId(slot._id, secretKey) === hashedIdSlotId);

        console.log(slotIndex);

        if (slotIndex === -1) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        // Check if the slot is already fully booked
        if (lab.slots[slotIndex].students.length >= lab.slots[slotIndex].totalStudents) {
            console.log("Break")
            return res.status(400).json({ error: 'Slot is fully booked' });
        }

        //fetch the name, roll number of that student using the email id
        let student = await User.findOne({ email: studentEmail });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const studentName = student.name;
        const studentRollNumber = student.rollnumber;

        console.log(slotIndex)

        if (slotIndex === -1) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        // Check if the slot is already fully booked
        if (lab.slots[slotIndex].students.length >= lab.slots[slotIndex].totalStudents) {
            return res.status(400).json({ error: 'Slot is fully booked' });
        }

        // Add the student to the slot
        lab.slots[slotIndex].students.push({ studentName ,studentEmail, rollNumber: studentRollNumber});

        await lab.save();

        res.status(200).json({ message: 'Slot booked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.studentInterview = async (req, res) => {
    try {
        const facultyEmail = req.userEmail;

        let faculty = await User.findOne({ email: facultyEmail });

        if (!faculty) {
            return res.status(200).json({ error: 'Faculty does not exist.' });
        }

        let specialLabCode = faculty.specialLabCode;

        let existingSpecialLab = await SpecialLab.findOne({ specialLabCode });

        if (!existingSpecialLab) {
            return res.status(200).json({ error: 'Special Lab does not exist.' });
        }

        let slots = existingSpecialLab.slots;

        slots = slots.map(slot => {
            return {
                date: slot.date,
                fromTime: slot.fromTime,
                toTime: slot.toTime,
                totalStudents: slot.totalStudents,
                hashedId: hashId(slot._id, process.env.SECRET_KEY),
                students: slot.students.map(student => ({
                    studentName: student.studentName,
                    studentEmail: student.studentEmail,
                    rollNumber: student.rollNumber,
                    hashedId: hashId(student._id, process.env.SECRET_KEY)
                }))
            };
        });

        res.status(200).json({ slots });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.studentInterviewResult = async (req, res) => {
    try {
        const facultyEmail = req.userEmail;

        let faculty = await User.findOne({ email: facultyEmail });
        
        if (!faculty) {
            return res.status(200).json({ error: 'Faculty does not exist.' });
        }

        let specialLabCode = faculty.specialLabCode;

        const { hashedSlotId, hashedStudentId, result } = req.body;
        const secretKey = process.env.SECRET_KEY;

        // Dehash the lab code to find the special lab
        let lab = await SpecialLab.findOne({specialLabCode: specialLabCode});

        if (!lab) {
            return res.status(404).json({ error: 'Lab not found' });
        }

        // Find the slot with the matching hash
        const slotIndex = lab.slots.findIndex(slot => hashId(slot._id, secretKey) === hashedSlotId);

        if (slotIndex === -1) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        // Find the student with the matching hash
        const studentIndex = lab.slots[slotIndex].students.findIndex(student => hashId(student._id, secretKey) === hashedStudentId);

        if (studentIndex === -1) {
            return res.status(404).json({ error: 'Student not found' });
        }

        if (result === "Selected") {
            //now update the spcial lab code and special lab name in the user table
            let student = await User.findOne({ email: lab.slots[slotIndex].students[studentIndex].studentEmail });

            student.specialLabCode = specialLabCode;
            student.specialLab = lab.specialLabName;

            await student.save();
        }

        // the result need to be update just remove the student from the slot
        lab.slots[slotIndex].students.splice(studentIndex, 1);

        console.log("slotIndex", result)

        await lab.save();

        res.status(200).json({ message: 'Result updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}