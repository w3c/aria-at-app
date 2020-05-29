const { Router } = require('express');
const CycleController = require('../controllers/CycleController');

const router = Router();

// Add or delete a cycle
router.post('/', CycleController.configureCycle);
router.delete('/', CycleController.deleteCycle);

// Gets all cycles
router.get('/', CycleController.getAllCycles);

// Gets all issues by test id
router.get('/issues', CycleController.getIssuesByTestId);

// Save an issue to github and create a record locally
router.post('/issue', CycleController.createIssue);

// Save result
router.post('/result', CycleController.saveTestResults);

// Gets all runs for a given cycle
router.get('/runs', CycleController.getTestsForRunsForCycle);

// Saves new status for run
router.post('/run/status', CycleController.saveRunStatus);

// Gets test version information necessary to initiate cycle
router.get('/testversions', CycleController.getAllTestVersions);

module.exports = router;
