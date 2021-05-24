const testPlanReportsResolver = parent => {
    return parent.testPlanReports.map(each => {
        return {
            ...each.dataValues,
            status: each.publishStatus.toUpperCase(),
            isAcceptingResults: each.status === 'draft'
        };
    });
};

module.exports = testPlanReportsResolver;
