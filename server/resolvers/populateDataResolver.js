const populateData = require('../services/PopulatedData/populateData');

const populateDataResolver = async (_, { locationOfData }, context) => {
  return populateData(locationOfData, { context });
};

module.exports = populateDataResolver;
