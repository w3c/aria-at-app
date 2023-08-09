const isFinalResolver = async testPlanReport => {
    return !!testPlanReport.approvedAt;
};

module.exports = isFinalResolver;
