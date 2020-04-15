const { Router } = require('express');
const router = Router();
const AuthController = require('../../controllers/AuthController');

router.get('/oauth', (req, res) => res.redirect(303, 'localhost:5000'));
router.get('/authorize', (req, res) => res.redirect(303, 'localhost:5000'));
router.get('/me', AuthController.currentUser);
router.post('/logout', AuthController.logout);

module.exports = router;
