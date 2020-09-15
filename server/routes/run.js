const { Router } = require('express');
const RunController = require('../controllers/RunController');

const router = Router();

router.post('/', RunController.configureRuns);
router.get('/active', RunController.getActiveRuns);
router.get('/published', RunController.getPublishedRuns);

module.exports = router;
