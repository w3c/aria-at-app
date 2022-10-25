const { Router } = require('express');
const { createIssue } = require('../controllers/GithubController');

const router = Router();

router.post('/issue', createIssue);

module.exports = router;
