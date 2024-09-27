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

router.post('/addSpecialLab', verifyRoles([roles.ADMIN]), userController.addSpecialLab);
router.delete('/removeSpecialLab', verifyRoles([roles.ADMIN]),userController.removeSpecialLab);
router.post('/addFaculty', verifyRoles([roles.ADMIN]), userController.addFaculty);
router.delete('/removeFaculty', verifyRoles([roles.ADMIN]), userController.removeFaculty);
router.get('/getlabsNames', verifyRoles([roles.ADMIN, roles.STUDENT]), userController.getLabsNames);
router.get('/getLabDetailsById/:id', verifyRoles([roles.ADMIN, roles.STUDENT]), userController.getLabDetailsById);
router.get('/faculty/getLabDetails', verifyRoles([roles.FACULTY]), userController.FacultyGetLabDetails);

module.exports = router;