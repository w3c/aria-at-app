const { Router } = require('express');
const {
    oauthRedirectToGithubController,
    oauthRedirectFromGithubController,
    signoutController
} = require('../controllers/AuthController');

const router = Router();

router.get('/oauth', oauthRedirectToGithubController);
router.get('/authorize', oauthRedirectFromGithubController);
router.post('/signout', signoutController);

module.exports = router;
