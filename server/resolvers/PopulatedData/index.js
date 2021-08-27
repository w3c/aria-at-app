const {
    getTestPlanVersionById,
    getTestPlanById
} = require('../../models/services/TestPlanVersionService');
const {
    getTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const {
    getTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const locationOfDataId = require('../../util/locationOfDataId');

const PopulatedData = async ({ parentContext: { locationOfData } }) => {
    let {
        testPlanId,
        testPlanVersionId,
        testPlanReportId,
        testPlanRunId,
        testPlanTargetId,
        atId,
        browserId,
        atVersion: providedAtVersion,
        browserVersion: providedBrowserVersion,
        testId,
        scenarioId,
        assertionId,
        testResultId,
        scenarioResultId,
        assertionResultId
    } = locationOfData;

    if (assertionId || scenarioId) {
        ({ testId } = locationOfDataId.decode(assertionId || scenarioId));
    }
    if (testId) {
        ({ testPlanVersionId } = locationOfDataId.decode(testId));
    }
    if (assertionResultId) {
        ({ scenarioResultId } = locationOfDataId.decode(assertionResultId));
    }
    if (scenarioResultId) {
        ({ testResultId } = locationOfDataId.decode(scenarioResultId));
    }
    if (testResultId) {
        ({ testPlanRunId } = locationOfDataId.decode(testResultId));
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
    } else if (testPlanId) {
        testPlan = await getTestPlanById(testPlanId);
    }

    const testPlanTarget = testPlanReport && testPlanReport.testPlanTarget;
    const at = testPlanTarget && testPlanTarget.at;
    const browser = testPlanTarget && testPlanTarget.browser;
    const atVersion = testPlanTarget && testPlanTarget.atVersion;
    const browserVersion = testPlanTarget && testPlanTarget.browserVersion;

    testPlan =
        testPlanVersion && !testPlan
            ? {
                  id: testPlanVersion.metadata.directory,
                  directory: testPlanVersion.metadata.directory
              }
            : null;

    let test;
    let scenario;
    let assertion;
    let testResult;
    let scenarioResult;
    let assertionResult;

    if (testResultId) {
        testResult = testPlanRun.testResults.find(
            each => each.id === testResultId
        );
    }
    if (scenarioResultId) {
        scenarioResult = testResult.scenarioResults.find(
            each => each.id === scenarioResultId
        );
    }
    if (testId) {
        test = testPlanVersion.tests.find(each => each.id === testId);
    }
    if (scenarioId) {
        scenario = test.scenarios.find(each => each.id === scenarioId);
    }
    if (assertionId) {
        assertion = test.assertions.find(each => each.id === assertionId);
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
