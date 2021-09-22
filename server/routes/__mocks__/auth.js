const { Router } = require('express');
const router = Router();
const AuthController = require('../../controllers/AuthController');

router.get('/oauth', (req, res) => res.redirect(303, 'localhost:5020'));
router.get('/authorize', (req, res) => res.redirect(303, 'localhost:5020'));
router.get('/me', AuthController.currentUser);
router.post('/signout', AuthController.signout);

module.exports = router;
