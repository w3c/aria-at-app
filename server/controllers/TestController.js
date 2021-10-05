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

module.exports = {
    importTests
};
