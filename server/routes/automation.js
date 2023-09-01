const { Router } = require('express');
const {
    scheduleNewJob,
    cancelJob,
    restartJob,
    getJobLog,
    updateJobStatus,
    deleteJob,
    updateJobResults
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

router.post('/:jobID/delete', deleteJob);

router.post('/:jobID/result', verifyAutomationScheduler, updateJobResults);

module.exports = router;
