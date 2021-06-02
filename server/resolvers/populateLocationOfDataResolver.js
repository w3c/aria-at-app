const populateLocationOfDataResolver = async (_, { locationOfData }) => {
    return { parentContext: { locationOfData } };
};

module.exports = populateLocationOfDataResolver;
