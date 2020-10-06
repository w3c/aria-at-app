const { Router } = require('express');
const TestVersionController = require('../controllers/TestVersionController');

const router = Router();

router.get('/', TestVersionController.getNewTestVersions);

module.exports = router;
