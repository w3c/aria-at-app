const { Router } = require('express');
const {
    login,
    authorize,
    currentUser,
    logout
} = require('../controllers/AuthController');

const router = Router();

router.get('/login', login);
router.get('/authorize', authorize);
router.get('/me', currentUser);
router.post('/logout', logout);

module.exports = router;
