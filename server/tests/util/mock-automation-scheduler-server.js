const { GracefulShutdownManager } = require('@moebius/http-graceful-shutdown');
const express = require('express');
const {
    verifyAutomationScheduler
} = require('../../middleware/verifyAutomationScheduler');

const setupMockAutomationSchedulerServer = async () => {
    const app = express();
    app.use(express.json());
    app.use(verifyAutomationScheduler);

    let shutdownManager;
    await new Promise(resolve => {
        const listener = app.listen('6688', resolve);
        shutdownManager = new GracefulShutdownManager(listener);
    });

    app.post('/jobs/new', (req, res) => {
        return res.json({ jobID: '999', status: 'QUEUED' });
    });

    app.post('/jobs/:jobID/cancel', (req, res) => {
        return res.json({ id: req.params.jobID, status: 'CANCELED' });
    });

    app.post('/jobs/:jobID/restart', (req, res) => {
        return res.json({ id: req.params.jobID, status: 'QUEUED' });
    });

    app.get('/jobs/:jobID/log', (req, res) => {
        return res.json({ id: req.params.jobID, log: 'TEST LOG' });
    });

    const tearDown = async () => {
        await new Promise(resolve => {
            shutdownManager.terminate(resolve);
        });
    };

    return {
        tearDown
    };
};

module.exports = setupMockAutomationSchedulerServer;
