const { Router } = require('express');
const UsersController = require('../data/controllers/usersController');

const router = Router();

router.post('/', UsersController.addUser);
router.post('/role', UsersController.addUserToRole);

module.exports = router;
