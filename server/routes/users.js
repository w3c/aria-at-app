const { Router } = require('express');
const UsersController = require('../controllers/UsersController');

const router = Router();

// Add new user
router.put('/', UsersController.addUser);

// Get all users and their configs
router.get('/', UsersController.getAllTesters);

// Add user to role
router.post('/role', UsersController.addUserToRole);

// Add or delete list of users to run
router.post('/run', UsersController.assignUsersToRun);
router.delete('/run', UsersController.removeUsersFromRun);

// Get or set ATs for a given user
router.post('/ats', UsersController.setUserAts);

module.exports = router;
