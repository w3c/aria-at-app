const { ATModel } = require('../models/ATModel');

async function getATNames() {
    try {
        const atNames = await ATModel.findAll({
            attributes: ['name']
          });
        return { names: atNames.map(atObj => atObj.name) };
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

module.exports = {
    getATNames
}