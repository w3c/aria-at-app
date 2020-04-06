const { Router } = require('express');
const { addUser, addUserToRole } = require('../controllers/UsersController');

const router = Router();

router.put('/', addUser);
router.post('/role', addUserToRole);

module.exports = router;
