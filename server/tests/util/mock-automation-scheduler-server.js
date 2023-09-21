const { GracefulShutdownManager } = require('@moebius/http-graceful-shutdown');
const express = require('express');
const {
    verifyAutomationScheduler
} = require('../../middleware/verifyAutomationScheduler');
const { COLLECTION_JOB_STATUS } = require('../../util/enums');

const setupMockAutomationSchedulerServer = async () => {
    const app = express();
    app.use(express.json());
    app.use(verifyAutomationScheduler);

    let shutdownManager;
    await new Promise(resolve => {
        const listener = app.listen(
            process.env.AUTOMATION_SCHEDULER_PORT,
            resolve
        );
        shutdownManager = new GracefulShutdownManager(listener);
    });

    const generateRandomId = () => {
        return Math.floor(Math.random() * 1000000).toString();
    };

    app.post('/jobs/new', (req, res) => {
        if (process.env.ENVIRONMENT === 'test') {
            return res.json({
                id: '999',
                status: COLLECTION_JOB_STATUS.QUEUED
            });
        } else {
            return res.json({
                id: generateRandomId(),
                status: COLLECTION_JOB_STATUS.QUEUED
            });
        }
    });

    app.post('/jobs/:jobID/cancel', (req, res) => {
        return res.json({
            id: req.params.jobID,
            status: COLLECTION_JOB_STATUS.CANCELLED
        });
    });

    app.post('/jobs/:jobID/restart', (req, res) => {
        return res.json({
            id: req.params.jobID,
            status: COLLECTION_JOB_STATUS.QUEUED
        });
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
