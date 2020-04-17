const { Router } = require('express');
const ATController = require('../controllers/ATController');

const router = Router();

router.get('/', ATController.getATs);

module.exports = router;
