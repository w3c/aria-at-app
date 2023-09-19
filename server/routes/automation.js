const { Router } = require('express');
const {
    cancelJob,
    getJobLog,
    updateJobStatus,
    deleteJob,
    updateJobResults
} = require('../controllers/AutomationController');
const {
    verifyAutomationScheduler
} = require('../middleware/verifyAutomationScheduler');
const { handleError } = require('../middleware/handleError');

const router = Router();

router.get('/:jobID/log', getJobLog, handleError);

router.post('/:jobID/cancel', cancelJob, handleError);

router.post(
    '/:jobID/update',
    verifyAutomationScheduler,
    updateJobStatus,
    handleError
);

router.post('/:jobID/delete', deleteJob, handleError);

router.post(
    '/:jobID/result',
    verifyAutomationScheduler,
    updateJobResults,
    handleError
);

module.exports = router;
