const { Router } = require('express');
const { executeOpenWebPage } = require('../controllers/ScriptController');

const router = Router();

router.post('/open-web-page', executeOpenWebPage);

module.exports = router;
