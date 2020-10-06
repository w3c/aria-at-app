const RunService = require('../services/RunService');

async function getNewTestVersions(req, res) {
    try {
        const testVersions = await RunService.getNewTestVersions();
        res.status(201).json(testVersions);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in TestVersionController: ${error}`);
    }
}

module.exports = {
    getNewTestVersions
};
