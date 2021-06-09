const populateDataResolver = async (_, { locationOfData }) => {
    return { parentContext: { locationOfData } };
};

module.exports = populateDataResolver;
