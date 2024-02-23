const {
    getUniqueAtVersionsForReport
} = require('../../models/services/AtService');

const atVersionsResolver = async (testPlanReport, _, context) => {
    const { t } = context;

    const results = await getUniqueAtVersionsForReport(testPlanReport.id, {
        t
    });

    return results.map(({ atVersionId, name, releasedAt }) => ({
        id: atVersionId,
        name,
        releasedAt
    }));
};

module.exports = atVersionsResolver;
