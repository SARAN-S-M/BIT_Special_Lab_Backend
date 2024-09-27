const express = require('express');
const router = express.Router();
const userController = require('./controller');
const verifyRoles = require('../../middleware/auth');

const roles = {
    ADMIN: 'admin',
    STUDENT: 'student',
    FACULTY: 'faculty',
    MENTOR: 'mentor'
};

router.get('/HelpMaterials', verifyRoles([roles.ADMIN, roles.STUDENT]), userController.getHelpMaterials);
router.post('/addHelpMaterial', verifyRoles([roles.ADMIN]), userController.addHelpMaterial);
router.delete('/removeHelpMaterial', verifyRoles([roles.ADMIN]), userController.removeHelpMaterial);

module.exports = router;