const { Router } = require('express');
const TestController = require('../controllers/TestController');

const router = Router();

router.post('/import', TestController.importTests);

router.post('/result', TestController.saveTestResults);

router.post('/result/delete', TestController.deleteTestResultsForRunAndUser);

router.get('/issues', TestController.getIssuesByTestId);
router.post('/issue', TestController.createIssue);

module.exports = router;
