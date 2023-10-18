const mutateRequiredReportResolver = (_, { atId, browserId, phase }) => {
    return { parentContext: { atId, browserId, phase } };
};

module.exports = mutateRequiredReportResolver;
