const RunService = require('../services/RunService');

async function configureRuns(req, res) {
    const cycle = req.body.data;
    try {
        const savedRun = await RunService.configureRuns(cycle);
        res.status(201).json(savedRun);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in RunController: ${error}`);
    }
}

async function getActiveRuns(req, res) {
    try {
        const cycles = await RunService.getActiveRuns();
        res.status(201).json(cycles);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in RunController: ${error}`);
    }
}

async function getPublishedRuns(req, res) {
    try {
        const cycles = await RunService.getPublishedRuns();
        res.status(201).json(cycles);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in RunController: ${error}`);
    }
}

module.exports = {
    configureRuns,
    getActiveRuns,
    getPublishedRuns
};
