const { Router } = require('express');
const { login, authorize } = require('../data/controllers/AuthController');

const router = Router();

router.get('/login', login);
router.get('/authorize', authorize);

module.exports = router;
