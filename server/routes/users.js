const { Router } = require('express');
const { addUser, addUserToRole } = require('../controllers/UsersController');

const router = Router();

router.put('/', addUser);
router.post('/role', addUserToRole);

router.post('/assigntorun', UsersController.assignUsersToRun);
router.post('/removefromrun', UsersController.removeUsersFromRun);

// This will return all the testers configurations
// So, which testers can test which platform
router.post('/config', UsersController.getAllTesters);

module.exports = router;
