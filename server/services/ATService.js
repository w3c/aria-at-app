const { ATModel } = require('../models/ATModel');

async function getATs() {
    try {
        const ats = await ATModel.findAll();
        return ats;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

module.exports = {
    getATs
};
