const { Router } = require('express');
const CycleController = require('../data/controllers/cycleController');

const router = Router();

router.post('/', CycleController.configureCycle);

router.post('/delete', CycleController.deleteCycle);

// Maybe I should use a "get" like: router.get('/', CycleController.getAllCycles);
// and then when you want to get all cycles, you send a GET request, when you want to save, you send a POST?
router.post('/cycles', CycleController.getAllCycles);

// This might not belong here
router.post('/testversions', CycleController.getAllTestVersions);

module.exports = router;
