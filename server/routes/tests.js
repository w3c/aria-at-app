const { Router } = require('express');
const { importTests } = require('../controllers/TestController');

const router = Router();

router.post('/import', importTests);

module.exports = router;
