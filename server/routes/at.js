const { Router } = require('express');
const ATController = require('../controllers/ATController');

const router = Router();

router.get('/', ATController.getATNames);

module.exports = router;
