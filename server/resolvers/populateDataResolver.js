const { populateData } = require('../services/PopulatedData');

const populateDataResolver = async (_, { locationOfData }) => {
    return populateData(locationOfData);
};

module.exports = populateDataResolver;
