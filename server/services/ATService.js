const db = require('../models/index');

async function getATs() {
    try {
        const ats = await db.AtName.findAll();
        return ats;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

module.exports = {
    getATs
};
