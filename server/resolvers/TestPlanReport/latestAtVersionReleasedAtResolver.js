const {
    getUniqueAtVersionsForReport
} = require('../../models/services/AtService');

const latestAtVersionReleasedAtResolver = async (
    testPlanReport,
    _,
    context
) => {
    const { transaction } = context;

    // Return first element because result should already be sorted by descending
    // order of releasedAt date for AtVersion
    const results = await getUniqueAtVersionsForReport(testPlanReport.id, {
        transaction
    });
    if (results[0]) {
        const { atVersionId, name, releasedAt } = results[0];
        return {
            id: atVersionId,
            name,
            releasedAt
        };
    }

    // When TestPlanReport is DRAFT and an assigned tester hasn'transaction set a
    // TestPlanVersion
    return null;
};

module.exports = latestAtVersionReleasedAtResolver;
