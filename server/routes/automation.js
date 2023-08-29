const { Router } = require('express');
const {
    scheduleNewJob,
    cancelJob,
    restartJob,
    getJobLog,
    updateJobStatus
} = require('../controllers/AutomationController');
const {
    verifyAutomationScheduler
} = require('../middleware/verifyAutomationScheduler');

const router = Router();

router.get('/:jobID/log', getJobLog);

router.post('/new', scheduleNewJob);

router.post('/:jobID/cancel', cancelJob);

router.post('/:jobID/restart', restartJob);

router.post('/:jobID/update', verifyAutomationScheduler, updateJobStatus);

module.exports = router;
