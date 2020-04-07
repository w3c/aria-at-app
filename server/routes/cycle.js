const { Router } = require('express');
const CycleController = require('../controllers/CycleController');

const router = Router();

// Add or delete a cycle
router.post('/', CycleController.configureCycle);
router.delete('/', CycleController.deleteCycle);

// Gets all cycles
router.get('/', CycleController.getAllCycles);

// Gets test version information necessary to initiate cycle
router.get('/testversions', CycleController.getAllTestVersions);

module.exports = router;
