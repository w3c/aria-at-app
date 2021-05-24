const testPlanReportsResolver = parent => {
    return parent.testPlanReports.map(each => {
        return {
            ...each.dataValues,
            status: each.publishStatus.toUpperCase()
        };
    });
};

module.exports = testPlanReportsResolver;
