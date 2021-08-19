const populatedDataResolver = require('./PopulatedData');

const populateDataResolver = async (_, { locationOfData }) => {
    // Normally you can just do `return { parentContext: { locationOfData } }`
    // I am not sure why that is not the case with this resolver.
    return populatedDataResolver({ parentContext: { locationOfData } });
};

module.exports = populateDataResolver;
