const { Router } = require('express');
const {
  oauthRedirectToGithubController,
  oauthRedirectFromGithubController,
  signoutController
} = require('../controllers/AuthController');
const setFakeUserController = require('../controllers/FakeUserController');

const router = Router();

router.get('/oauth', oauthRedirectToGithubController);
router.get('/authorize', oauthRedirectFromGithubController);
router.post('/signout', signoutController);
router.post('/fake-user', setFakeUserController);

module.exports = router;
