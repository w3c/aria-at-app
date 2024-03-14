const isFinalResolver = async (
    testPlanReport,
    args, // eslint-disable-line no-unused-vars
    context // eslint-disable-line no-unused-vars
) => {
    return !!testPlanReport.markedFinalAt;
};

module.exports = isFinalResolver;
