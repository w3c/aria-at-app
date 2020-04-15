const { Router } = require('express');
const CycleController = require('../controllers/CycleController');

const router = Router();

// Add or delete a cycle
router.post('/', CycleController.configureCycle);
router.delete('/', CycleController.deleteCycle);

// Gets all cycles
router.get('/', CycleController.getAllCycles);

// Save result
router.post('/result', CycleController.saveTestResults);

// Gets all runs for a given cycle and user
router.get('/runs', CycleController.getRunsForCycleAndUser);

// Gets test version information necessary to initiate cycle
router.get('/testversions', CycleController.getAllTestVersions);

module.exports = router;
