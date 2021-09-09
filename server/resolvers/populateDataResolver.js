const populateData = require('../services/PopulatedData/populateData');

const populateDataResolver = async (_, { locationOfData }) => {
    return populateData(locationOfData);
};

module.exports = populateDataResolver;
