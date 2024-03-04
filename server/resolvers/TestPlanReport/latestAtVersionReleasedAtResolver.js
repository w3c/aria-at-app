const {
    getUniqueAtVersionsForReport
} = require('../../models/services.deprecated/AtService');

const latestAtVersionReleasedAtResolver = async testPlanReport => {
    // Return first element because result should already be sorted by descending
    // order of releasedAt date for AtVersion
    const results = await getUniqueAtVersionsForReport(testPlanReport.id);
    if (results[0]) {
        const { atVersionId, name, releasedAt } = results[0];
        return {
            id: atVersionId,
            name,
            releasedAt
        };
    }

    // When TestPlanReport is DRAFT and an assigned tester hasn't set a
    // TestPlanVersion
    return null;
};

module.exports = latestAtVersionReleasedAtResolver;
