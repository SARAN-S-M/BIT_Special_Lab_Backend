const jwt = require('jsonwebtoken');
const Users = require('../src/User/model');

const verifyRoles = (allowedRoles) => async (req, res, next) => {
  try {
    // Extract the JWT token from the authorization header
    const tokenWithBearer = req.headers.authorization;

    const token = tokenWithBearer.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Retrieve user details from the database using the email from the decoded token
    const user = await Users.findOne({ _id: decodedToken.userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user's role matches any of the allowed roles
    const userRole = user.role;

    // Check if user's role matches any of the allowed roles passed as argument
    if (allowedRoles.includes(userRole)) {
      // If the user has an allowed role, attach the email to the request and proceed
      req.userEmail = user.email;
      // res.setHeader('userEmail', user.email);
      next();
    } else {
      // If user's role doesn't match any of the allowed roles, return unauthorized
      return res.status(403).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Error in verifyRoles middleware:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = verifyRoles;
