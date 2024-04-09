const { getAts, getAtVersionById } = require('../../models/services/AtService');

const firstRequiredAtVersionResolver = async (
    testPlanVersion,
    { atId },
    context
) => {
    const { transaction } = context;

    if (
        !testPlanVersion.testPlanReports.length ||
        testPlanVersion.phase !== 'RECOMMENDED'
    ) {
        return null;
    }

    // To track the required reports for RECOMMENDED phase
    const ats = await getAts({ transaction });

    let firstRequiredAtVersion = null;
    for (const testPlanReport of testPlanVersion.testPlanReports.filter(
        testPlanReport => testPlanReport.atId == atId
    )) {
        const browserId = testPlanReport.browserId;

        // Need to check if is required report for a primary test plan run
        const isRequiredReport = ats
            .find(at => at.id == atId)
            .browsers.find(browser => browser.id == browserId)
            .AtBrowsers.isRecommended;

        if (isRequiredReport) {
            const primaryRun =
                testPlanReport.testPlanRuns.find(
                    ({ isPrimary }) => isPrimary
                ) || testPlanReport.testPlanRuns[0];
            const primaryRunAtVersionId = primaryRun.testResults[0].atVersionId;
            const atVersion = await getAtVersionById({
                id: primaryRunAtVersionId,
                transaction
            });

            if (
                !firstRequiredAtVersion ||
                new Date(atVersion.releasedAt) <
                    new Date(firstRequiredAtVersion.releasedAt)
            ) {
                firstRequiredAtVersion = {
                    id: atVersion.id,
                    name: atVersion.name,
                    releasedAt: atVersion.releasedAt
                };
            }
        }
    }

    return firstRequiredAtVersion;
};

module.exports = firstRequiredAtVersionResolver;
