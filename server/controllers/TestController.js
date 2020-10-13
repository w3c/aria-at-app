const TestService = require('../services/TestService');

async function importTests(req, res) {
    const { git_hash } = req.body;
    try {
        await TestService.importTests(git_hash);
        res.sendStatus(200);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error.message);
        // This is when the script fails because the git hash is invalid
        // Sending semantic error.
        res.sendStatus(422);
    }
}

async function saveTestResults(req, res) {
    try {
        const testResult = req.body.data;
        const savedTestResult = await TestService.saveTestResults(testResult);
        res.status(201).json(savedTestResult);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in TestController: ${error}`);
    }
}

module.exports = {
    importTests,
    saveTestResults
};
