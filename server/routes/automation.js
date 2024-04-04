const { Router } = require('express');
const {
    updateJobStatus,
    updateJobResults
} = require('../controllers/AutomationController');
const {
    verifyAutomationScheduler
} = require('../middleware/verifyAutomationScheduler');
const { handleError } = require('../middleware/handleError');

const router = Router();

// Old Way (backwards compat)
router.post('/:jobID/update', verifyAutomationScheduler, updateJobStatus);
router.post('/:jobID/result', verifyAutomationScheduler, updateJobResults);

// New way
router.post('/:jobID', verifyAutomationScheduler, updateJobStatus);
router.post('/:jobID/test/:testRowNumber', verifyAutomationScheduler, updateJobResults);

router.use(handleError);

module.exports = router;
