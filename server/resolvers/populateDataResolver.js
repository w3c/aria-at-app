const populateData = require('../services/PopulatedData/populateData');

const populateDataResolver = async (_, { locationOfData }, context) => {
  const { transaction } = context;

  return populateData(locationOfData, { transaction });
};

module.exports = populateDataResolver;
