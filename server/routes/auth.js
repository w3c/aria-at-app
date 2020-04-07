const { Router } = require('express');
const {
    login,
    authorize,
    currentUser
} = require('../controllers/AuthController');

const router = Router();

router.get('/login', login);
router.get('/authorize', authorize);
router.get('/me', currentUser);

module.exports = router;
