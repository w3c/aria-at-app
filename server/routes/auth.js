const { Router } = require('express');
const {
    oauthRedirectToGithubController,
    oauthRedirectFromGithubController,
    integrationTestSignInController,
    signOutController
} = require('../controllers/AuthController');

const router = Router();

router.get('/oauth', oauthRedirectToGithubController);
router.get('/authorize', oauthRedirectFromGithubController);
router.post('/integration-test-sign-in', integrationTestSignInController);
router.post('/signout', signOutController);

module.exports = router;
