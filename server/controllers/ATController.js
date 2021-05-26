const ATService = require('../services/ATService');

async function getATs(req, res) {
    try {
        const ats = await ATService.getATs();
        res.status(200).json(ats);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in UsersController: ${error}`);
    }
}

module.exports = {
    getATs,
};
