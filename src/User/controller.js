const User = require('./model.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const createUserToken = (user, statusCode, res) => {
    const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(statusCode).json({ token, userId: user._id, role: user.role });
};

exports.login = async (req, res) => {
    try {
        const { email } = req.body;
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
