const RunService = require('../services/TestRunService');

async function getTestVersions(req, res) {
    try {
        const testVersions = await RunService.getTestVersions();
        res.status(201).json(testVersions);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in TestVersionController: ${error}`);
    }
}

module.exports = {
    getTestVersions
};
