const { Router } = require('express');
const {
    importTests,
    getIssuesByTestId,
    createIssue
} = require('../controllers/TestController');

const router = Router();

router.post('/import', importTests);
router.get('/issues', getIssuesByTestId);
router.post('/issues', createIssue);

module.exports = router;
