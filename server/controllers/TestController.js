const TestService = require('../services/TestService');

module.exports = {
    importTests(req, res) {
        const { gitHash } = req.body;
        const response = TestService.importTests(gitHash);
        res.status(200).json(response);
    }
}