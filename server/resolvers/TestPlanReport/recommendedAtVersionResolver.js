const {
    getUniqueAtVersionsForReport
} = require('../../models/services/AtService');

const recommendedAtVersionResolver = async (testPlanReport, _, context) => {
    const { transaction } = context;

    if (
        testPlanReport.markedFinalAt &&
        testPlanReport.testPlanVersion.phase !== 'RECOMMENDED'
    )
        return null;

    // Get all unique AT Versions used with the TestPlanReport
    const uniqueAtVersions = await getUniqueAtVersionsForReport(
        testPlanReport.id,
        { transaction }
    );

    // TODO: When #997 is implemented, should just default to using exact AT
    //  version if TestPlanReport is created in that way

    // Use the latest AT version; first element because pre-sorted in descending
    // order by AtVersion.releasedAt
    if (uniqueAtVersions.length) {
        const [latestAtVersion] = uniqueAtVersions;

        return {
            id: latestAtVersion.atVersionId,
            name: latestAtVersion.name,
            releasedAt: latestAtVersion.releasedAt
        };
    }

    return null;
};

module.exports = recommendedAtVersionResolver;
