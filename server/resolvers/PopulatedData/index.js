const {
    getTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');
const {
    getTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const {
    getTestPlanRunById
} = require('../../models/services/TestPlanRunService');

const PopulatedData = async ({ parentContext: { locationOfData } }) => {
    const {
        testPlanId,
        testPlanVersionId,
        testPlanReportId,
        testPlanRunId,
        testPlanTargetId,
        atId,
        browserId,
        atVersion: providedAtVersion,
        browserVersion: providedBrowserVersion,
        testIndex,
        passThroughIndex,
        testResultIndex,
        passThroughResultIndex
    } = locationOfData;

    if (
        testIndex ||
        passThroughIndex ||
        testResultIndex ||
        passThroughResultIndex
    ) {
        throw new Error('Not implemented');
    }

    let testPlan;
    let testPlanVersion;
    let testPlanReport;
    let testPlanRun;

    if (testPlanRunId) {
        testPlanRun = await getTestPlanRunById(testPlanRunId);
        testPlanReport = testPlanRun && testPlanRun.testPlanReport;
        testPlanVersion = testPlanReport && testPlanReport.testPlanVersion;
    } else if (testPlanReportId) {
        testPlanReport = await getTestPlanReportById(testPlanReportId);
        testPlanVersion = testPlanReport && testPlanReport.testPlanVersion;
    } else if (testPlanVersionId) {
        testPlanVersion = await getTestPlanVersionById(testPlanVersionId);
    }

    const testPlanTarget = testPlanReport && testPlanReport.testPlanTarget;
    const at = testPlanTarget && testPlanTarget.at;
    const browser = testPlanTarget && testPlanTarget.browser;
    const atVersion = testPlanTarget && testPlanTarget.atVersion;
    const browserVersion = testPlanTarget && testPlanTarget.browserVersion;

    if (!testPlanVersion) {
        // TODO: This error can be removed when we refine the versioning
        throw new Error(
            'LocationOfData without an associated test plan version is not ' +
                'yet implemented. Note you may see this error if the data ' +
                'you requested could not be found.'
        );
    }
    testPlan = { id: testPlanVersion.metadata.directory };

    if (
        testPlanRun &&
        testPlanRun.testResults &&
        testPlanRun.testResults.length
    ) {
        const testResults = testPlanRun.testResults.map(each => ({
            ...each.test,
            ...each
        }));
        testPlanRun.testResults = [...testResults];
    }

    const idsContradict = (provided, found) => {
        return (
            provided && (!found || provided.toString() !== found.id.toString())
        );
    };
    if (
        idsContradict(testPlanId, testPlan) ||
        idsContradict(testPlanVersionId, testPlanVersion) ||
        idsContradict(testPlanReportId, testPlanReport) ||
        idsContradict(testPlanRunId, testPlanRun) ||
        idsContradict(testPlanTargetId, testPlanTarget) ||
        idsContradict(atId, at) ||
        idsContradict(browserId, browser) ||
        (providedAtVersion && providedAtVersion !== atVersion) ||
        (providedBrowserVersion && providedBrowserVersion !== browserVersion)
    ) {
        throw new Error(
            'You provided IDs for both a parent and child model, implying a ' +
                'relationship, but no relationship was found'
        );
    }

    return {
        locationOfData,
        testPlan,
        testPlanVersion,
        testPlanReport,
        testPlanRun,
        testPlanTarget,
        at,
        browser,
        atVersion,
        browserVersion
    };
};

module.exports = PopulatedData;
