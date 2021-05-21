const testPlanReportsResolver = parent => {
    return parent.testPlanReports.map(each => {
        return {
            ...each.dataValues,
            status: each.dataValues.publishStatus.toUpperCase(),
            isAcceptingResults: each.dataValues.status === 'draft'
        };
    });
};

module.exports = testPlanReportsResolver;
