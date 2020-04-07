const { Router } = require('express');
const UsersController = require('../controllers/UsersController');

const router = Router();

// Add new user
router.put('/', UsersController.addUser);

// Add user to role
router.post('/role', UsersController.addUserToRole);

// Add or delete list of users to run
router.post('/run', UsersController.assignUsersToRun);
router.delete('/run', UsersController.removeUsersFromRun);

// Get tester configurations for all users
router.get('/config', UsersController.getAllTesters);

module.exports = router;
