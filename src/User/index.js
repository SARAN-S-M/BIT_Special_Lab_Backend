const express = require('express');
const router = express.Router();
const userController = require('./controller');

router.post('/login', userController.login);
router.post('/addUser', userController.addUser);
router.delete('/removeUser', userController.removeUser);
router.put('/blockUser', userController.blockUser);
router.put('/unblockUser', userController.unblockUser);
router.post('/getRoleData', userController.getRoleData);

module.exports = router;