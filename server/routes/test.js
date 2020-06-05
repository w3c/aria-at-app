const { Router } = require('express');
const TestController = require('../controllers/TestController');

const router = Router();

router.post('/import', TestController.importTests);

module.exports = router;
