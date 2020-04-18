const { Router } = require('express');
const {
    oauth,
    authorize,
    currentUser,
    logout
} = require('../controllers/AuthController');

const router = Router();

router.get('/oauth', oauth);
router.get('/authorize', authorize);
router.get('/me', currentUser);
router.post('/logout', logout);

module.exports = router;
