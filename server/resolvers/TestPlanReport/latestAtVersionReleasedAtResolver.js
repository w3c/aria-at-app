const {
    getUniqueAtVersionsForReport
} = require('../../models/services/AtService');

const latestAtVersionReleasedAtResolver = async testPlanReport => {
    // Return first element because result should already be sorted by descending
    // order of releasedAt date for AtVersion
    const results = await getUniqueAtVersionsForReport(testPlanReport.id);
    const { atVersionId, name, releasedAt } = results[0];

    return {
        id: atVersionId,
        name,
        releasedAt
    };
};

module.exports = latestAtVersionReleasedAtResolver;
