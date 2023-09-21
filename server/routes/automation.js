const { Router } = require('express');
const {
    getJobLog,
    updateJobStatus,
    updateJobResults
} = require('../controllers/AutomationController');
const {
    verifyAutomationScheduler
} = require('../middleware/verifyAutomationScheduler');
const { handleError } = require('../middleware/handleError');

const router = Router();

router.get('/:jobID/log', getJobLog);

router.post('/:jobID/update', verifyAutomationScheduler, updateJobStatus);

router.post('/:jobID/result', verifyAutomationScheduler, updateJobResults);

router.use(handleError);

module.exports = router;
