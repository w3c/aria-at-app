const { Router } = require('express');
const {
  executeEnableTalkback,
  executeOpenWebPage
} = require('../controllers/ScriptController');

const router = Router();

router.get('/enable-talkback', executeEnableTalkback);
router.post('/open-web-page', executeOpenWebPage);

module.exports = router;
