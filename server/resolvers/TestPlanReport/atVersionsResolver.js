const {
    getUniqueAtVersionsForReport
} = require('../../models/services.deprecated/AtService');

const atVersionsResolver = async testPlanReport => {
    const results = await getUniqueAtVersionsForReport(testPlanReport.id);

    return results.map(({ atVersionId, name, releasedAt }) => ({
        id: atVersionId,
        name,
        releasedAt
    }));
};

module.exports = atVersionsResolver;
