const User = require('./model.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const createUserToken = (user, statusCode, res) => {
    const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(statusCode).json({ token, userId: user._id, role: user.role });
};

// Add User Controller
exports.addUser = async (req, res) => {
    console.log("addUser", req.userEmail);
    //console log the headers
    console.log("addUser", req.headers);
    // console.log("addUser", req.body);
    // console.log("addUser", req.body.name,  req.body.email, req.body.rollNumber, req.body.role);
    try {
        const { name, email, rollNumber, role } = req.body;

        // Check if user with the same email or roll number already exists
        let existingUser = await User.findOne({ $or: [{ email }, { rollnumber: rollNumber }] });
        // console.log("existingUser", existingUser);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or roll number already exists' });
        }

        // Create new user with provided data
        const newUser = new User({
            name,
            email,
            rollnumber: rollNumber, // rollnumber in schema should match this
            role
        });

        // Save the new user to the database
        await newUser.save();

        return res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller to remove a user by email
exports.removeUser = async (req, res) => {
    try {
        const { email } = req.body; // Extract email from request body

        // Check if the email was provided
        if (!email) {
            console.log("Status 400");
            console.log(req);
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find and delete the user by email
        const user = await User.findOneAndDelete({ email });

        // If user not found, return a 404 error
        if (!user) {
            console.log("Status 404");
            return res.status(404).json({ error: 'User not found' });
        }

        // Return success response if user is deleted
        console.log("Status 200");
        return res.status(200).json({ message: 'User removed successfully' });
    } catch (error) {
        // Handle any internal server errors
        console.error('Error removing user:', error);
        console.log("Status 500");
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Block a user
exports.blockUser = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    try {
        const user = await User.findOneAndUpdate(
            { email },
            { status: false }, // Set status to false to block the user
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'User blocked successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Unblock a user
exports.unblockUser = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    try {
        const user = await User.findOneAndUpdate(
            { email },
            { status: true }, // Set status to true to unblock the user
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'User unblocked successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getRoleData = async (req, res) => {
    try {
        const { role } = req.body;

        const users = await User.find({ role }, 'name email rollnumber');

        console.log("users", users);

        if (!users) {
            console.log("Status 201");
            return res.status(201).json({ error: 'No users found with this role' });
        }

        const transformedUsers = users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            rollNumber: user.rollnumber // Changing the key here
        }));

        console.log("Status 200");
        
        res.status(200).json({ users: transformedUsers });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.login = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email);
        // const { email } = "faculty@bitsathy.ac.in";
        let user = await User.findOne({ email }); // Changed const to let



        if (!user) {

            //note : the email and the rollnumber must need to be unique
            user = new User({ name: "SARAN S M", email: email, rollnumber: "7376222AL194", role: "admin" });
            await user.save();
            // return res.status(404).send({ error: 'Login failed! Check authentication credentials' });
        }

        createUserToken(user, 200, res);
    } catch (error) {
        res.status(400).send({ error: 'Internal Server Error' }); // Send a generic error message
    }
};
