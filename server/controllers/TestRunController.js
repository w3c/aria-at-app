const TestRunService = require('../services/TestRunService');

async function configureRuns(req, res) {
    try {
        const savedRun = await TestRunService.configureRuns(req.body.data);
        res.status(201).json(savedRun);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in RunController: ${error}`);
    }
}

async function getActiveRuns(req, res) {
    try {
        const runs = await TestRunService.getActiveRuns();
        res.status(201).json(runs);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in RunController: ${error}`);
    }
}

async function getPublishedRuns(req, res) {
    try {
        const runs = await TestRunService.getPublishedRuns();
        res.status(201).json(runs);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in RunController: ${error}`);
    }
}

async function getActiveRunsConfiguration(req, res) {
    try {
        const config = await TestRunService.getActiveRunsConfiguration();
        res.status(201).json(config);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in RunController: ${error}`);
    }
}

async function saveRunStatus(req, res) {
    try {
        const run = req.body.data;
        const savedRun = await TestRunService.saveRunStatus(run);
        res.status(201).json(savedRun);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in RunController: ${error}`);
    }
}

module.exports = {
    configureRuns,
    getActiveRuns,
    getPublishedRuns,
    getActiveRunsConfiguration,
    saveRunStatus
};
