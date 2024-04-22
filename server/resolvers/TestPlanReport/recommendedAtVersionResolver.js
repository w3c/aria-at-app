const {
    getUniqueAtVersionsForReport
} = require('../../models/services/AtService');
const {
    getTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');

const recommendedAtVersionResolver = async (testPlanReport, _, context) => {
    const { transaction } = context;

    let phase;
    if (testPlanReport.testPlanVersion?.phase)
        phase = testPlanReport.testPlanVersion.phase;
    else {
        const testPlanVersion = await getTestPlanVersionById({
            id: testPlanReport.testPlanVersionId,
            testPlanVersionAttributes: ['phase'],
            testPlanReportAttributes: [],
            testPlanRunAttributes: [],
            atAttributes: [],
            browserAttributes: [],
            userAttributes: [],
            transaction
        });
        phase = testPlanVersion.phase;
    }

    if (!testPlanReport.markedFinalAt || phase !== 'RECOMMENDED') return null;

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
