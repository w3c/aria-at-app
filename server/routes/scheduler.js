const { Router } = require('express');

const router = Router();

router.post('/new', (req, res) => {
    res.json({ jobID: 'new-job-id' });
});

router.get('/:jobID/status', (req, res) => {
    res.json({ status: 'running' });
});

router.get('/:jobID/log', (req, res) => {
    res.type('text/plain').send('standard output and standard error stream');
});

router.post('/:jobID/cancel', (req, res) => {
    res.status(200).end();
});

router.post('/:jobID/restart', (req, res) => {
    res.status(200).end();
});

module.exports = router;
