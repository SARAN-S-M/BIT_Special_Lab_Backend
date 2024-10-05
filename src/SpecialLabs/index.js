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
router.post('/faculty/updateLabDetails', verifyRoles([roles.FACULTY]), userController.FacultyUpdateLabDetails);
router.post('/addSlot', verifyRoles([roles.FACULTY]), userController.addSlot);
router.get('/getSlots', verifyRoles([roles.FACULTY]), userController.getSlots);
router.get('/getSlotById/:id', verifyRoles([roles.STUDENT]), userController.getSlotsByLabId);
router.delete('/deleteSlot', verifyRoles([roles.FACULTY]), userController.deleteSlot);
router.post('/bookSlot/:id', verifyRoles([roles.STUDENT]), userController.bookSlot);
router.get('/student-interview', verifyRoles([roles.FACULTY]), userController.studentInterview);
router.post('/student-interview/result', verifyRoles([roles.FACULTY]), userController.studentInterviewResult);

module.exports = router;