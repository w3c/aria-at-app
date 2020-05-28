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
        const testResult = req.body.data;
        const savedTestResult = await CycleService.saveTestResults(testResult);
        res.status(201).json(savedTestResult);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in CycleController: ${error}`);
    }
}

async function getTestsForRunsForCycle(req, res) {
    try {
        const cycleId = parseInt(req.query.cycleId);
        const testsByRunId = await CycleService.getTestsForRunsForCycle(
            cycleId
        );
        res.status(201).json({ testsByRunId });
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in CycleController: ${error}`);
    }
}

async function saveRunStatus(req, res) {
    try {
        const run = req.body.data;
        const savedRun = await CycleService.saveRunStatus(run);
        res.status(201).json(savedRun);
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

async function getIssuesByTestId(req, res) {
    const test_id = parseInt(req.query.test_id);
    const { accessToken } = req.session;
    try {
        const issues = await CycleService.getIssuesByTestId({
            accessToken,
            test_id
        });
        res.status(200).json(issues);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in CycleController: ${error}`);
    }
}

async function createIssue(req, res) {
    const { run_id, test_id, title, body } = req.body.data;
    const { accessToken } = req.session;
    try {
        const result = await CycleService.createIssue({
            accessToken,
            run_id,
            test_id,
            title,
            body
        });
        res.status(201).json(result);
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
    getTestsForRunsForCycle,
    saveRunStatus,
    getAllTestVersions,
    getIssuesByTestId,
    createIssue
};
