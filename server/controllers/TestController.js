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

async function deleteTestResultsForRunAndUser(req, res) {
    try {
        const { userId, runId } = req.body;
        const deletedCount = await TestService.deleteTestResultsForRunAndUser({
            userId,
            runId
        });
        res.status(201).json({ count: deletedCount });
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in TestController: ${error}`);
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

async function getIssuesByTestId(req, res) {
    const test_id = parseInt(req.query.test_id);
    const { accessToken } = req.session;
    try {
        const issues = await TestService.getIssuesByTestId({
            accessToken,
            test_id
        });
        res.status(200).json(issues);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in TestController: ${error}`);
    }
}

async function createIssue(req, res) {
    const { run_id, test_id, title, body } = req.body.data;
    const { accessToken } = req.session;
    try {
        const result = await TestService.createIssue({
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
        console.error(`Error caught in TestController: ${error}`);
    }
}

module.exports = {
    deleteTestResultsForRunAndUser,
    importTests,
    saveTestResults,
    getIssuesByTestId,
    createIssue
};
