const { Router } = require('express');
const RunController = require('../controllers/TestRunController');

const router = Router();

router.post('/', RunController.configureRuns);
router.get('/active', RunController.getActiveRuns);
router.get('/published', RunController.getPublishedRuns);
router.get('/config', RunController.getActiveRunsConfiguration);

router.post('/status', RunController.saveRunStatus);

module.exports = router;
