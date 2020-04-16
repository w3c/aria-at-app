const CycleService = require('../services/CycleService');

async function configureCycle(req, res) {
    const cycle = req.body.data;
    try {
        const savedCycle = await CycleService.configureCycle(cycle);
        res.status(201).json(savedCycle);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in CycleController: ${error}`);
    }
}

async function getAllCycles(req, res) {
    try {
        const cycles = await CycleService.getAllCycles();
        res.status(201).json(cycles);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in CycleController: ${error}`);
    }
}

async function deleteCycle(req, res) {
    try {
        const cycleId = req.body.id;
        await CycleService.deleteCycle(cycleId);
        res.status(201).json({ cycleId });
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in CycleController: ${error}`);
    }
}

async function saveTestResults(req, res) {
    try {
        const testResult = req.body;
        const savedTestResult = await CycleService.saveTestResults(testResult);
        res.status(201).json(savedTestResult);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in CycleController: ${error}`);
    }
}

async function getRunsForCycleAndUser(req, res) {
    try {
        const cycleId = req.body.cycle_id;
        const userId = req.body.user_id;
        let runsById = await CycleService.getRunsForCycleAndUser(
            cycleId,
            userId
        );
        res.status(201).json({ runsById });
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in CycleController: ${error}`);
    }
}

async function getAllTestVersions(req, res) {
    try {
        const testVersions = await CycleService.getAllTestVersions();
        res.status(201).json(testVersions);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in CycleController: ${error}`);
    }
}

module.exports = {
    configureCycle,
    getAllCycles,
    deleteCycle,
    saveTestResults,
    getRunsForCycleAndUser,
    getAllTestVersions
};
