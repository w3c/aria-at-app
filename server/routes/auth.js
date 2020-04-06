const { Router } = require('express');
const { login, authorize } = require('../controllers/AuthController');

const router = Router();

router.get('/login', login);
router.get('/authorize', authorize);

module.exports = router;
