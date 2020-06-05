const TestService = require('../services/TestService');

module.exports = {
    async importTests(req, res, next) {
        const { git_hash } = req.body;
        try {
            await TestService.importTests(git_hash);
            res.sendStatus(200);
        } catch(error) {
            console.log(error.message);
            // This is when the script fails because the git hash is invalid
            // Sending semantic error.
            res.sendStatus(422);
        }  
    }
}