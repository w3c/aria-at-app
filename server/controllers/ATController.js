const ATService = require('../services/ATService');

async function getATNames(req, res) {
    try {
        const atNames = await ATService.getATNames();
        res.status(200).json(atNames);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in UsersController: ${error}`);
    }
}

module.exports = {
    getATNames
};
