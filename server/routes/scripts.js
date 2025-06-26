const { Router } = require('express');
const {
  executeEnableTalkback,
  executeOpenWebPage,
  checkDeviceStatus
} = require('../controllers/ScriptController');

const router = Router();

router.get('/device-status', checkDeviceStatus);
router.get('/enable-talkback', executeEnableTalkback);
router.post('/open-web-page', executeOpenWebPage);

module.exports = router;
