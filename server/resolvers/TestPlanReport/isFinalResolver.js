const isFinalResolver = async testPlanReport => {
    return !!testPlanReport.markedFinalAt;
};

module.exports = isFinalResolver;
