const testPlanReports = parent => {
    return parent.testPlanReports.map(each => {
        console.log(each.dataValues);
        return {
            ...each.dataValues,
            status: each.dataValues.publishStatus.toUpperCase(),
            isAcceptingResults: each.dataValues.status === 'draft'
        };
    });
};

module.exports = testPlanReports;
