const express = require('express');
const router = express.Router();
const userController = require('./controller');
const verifyRoles = require('../../middleware/auth'); // Import the middleware

// Define the roles
const roles = {
    ADMIN: 'admin',
    STUDENT: 'student',
    FACULTY: 'faculty',
    MENTOR: 'mentor'
};

// Apply the middleware to routes
router.post('/login', userController.login);
router.post('/addUser', verifyRoles([roles.ADMIN]), userController.addUser);
router.delete('/removeUser', verifyRoles([roles.ADMIN]), userController.removeUser);
router.put('/blockUser', verifyRoles([roles.ADMIN]), userController.blockUser);
router.put('/unblockUser', verifyRoles([roles.ADMIN]), userController.unblockUser);
router.post('/getRoleData', verifyRoles([roles.ADMIN]), userController.getRoleData);

module.exports = router;