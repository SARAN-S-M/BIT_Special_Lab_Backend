const express = require('express');
const router = express.Router();
const userController = require('./controller');


router.get('/HelpMaterials', userController.getHelpMaterials);
router.post('/addHelpMaterial', userController.addHelpMaterial);
router.delete('/removeHelpMaterial', userController.removeHelpMaterial);
// // router.post('/login', userController.login);
// // router.post('/addUser', userController.addUser);
// // router.delete('/removeUser', userController.removeUser);
// // router.put('/blockUser', userController.blockUser);
// // router.put('/unblockUser', userController.unblockUser);
// router.post('/addSpecialLab', userController.addSpecialLab);
// router.delete('/removeSpecialLab', userController.removeSpecialLab);
// router.post('/addFaculty', userController.addFaculty);
// router.delete('/removeFaculty', userController.removeFaculty);

module.exports = router;