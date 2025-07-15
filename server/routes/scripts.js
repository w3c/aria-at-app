const { Router } = require('express');
const {
  executeEnableTalkback,
  executeOpenWebPage,
  checkDeviceStatus,
  setProxyUrl,
  getProxyUrl
} = require('../controllers/ScriptController');

const router = Router();

router.get('/device-status', checkDeviceStatus);
router.get('/enable-talkback', executeEnableTalkback);
router.post('/open-web-page', executeOpenWebPage);
router.post('/proxy-url', setProxyUrl);
router.get('/proxy-url', getProxyUrl);

module.exports = router;
