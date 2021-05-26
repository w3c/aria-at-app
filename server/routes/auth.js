const { Router } = require('express');
const {
    oauth,
    authorize,
    currentUser,
    signout,
} = require('../controllers/AuthController');

const router = Router();

router.get('/oauth', oauth);
router.get('/authorize', authorize);
router.get('/me', currentUser);
router.post('/signout', signout);

module.exports = router;
