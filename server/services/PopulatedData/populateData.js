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
const { decodeLocationOfDataId } = require('./locationOfDataId');
const testsResolver = require('../../resolvers/TestPlanVersion/testsResolver');
const testsResultsResolver = require('../../resolvers/TestPlanRun/testResultsResolver');
const testPlanVersionTestPlanResolver = require('../../resolvers/TestPlanVersion/testPlanVersionTestPlanResolver');

/**
 *
 * @param {object} locationOfData - locationOfData as defined in GraphQL
 * @param {*} options
 * @param {*} options.preloaded - Used to prevent unnecessary database fetches,
 * you can provide a testPlanRun, testPlanReport, testPlanVersion or testPlan
 * and no database queries will be run by this function.
 * @returns
 */
const populateData = async (locationOfData, { preloaded } = {}) => {
    let {
        testPlanId,
        testPlanVersionId,
        testPlanReportId,
        testPlanRunId,
        // testPlanTargetId,
        // atId,
        // browserId,
        // atVersionId,
        // browserVersionId,
        testId,
        scenarioId,
        assertionId,
        testResultId,
        scenarioResultId,
        assertionResultId
    } = locationOfData;

    if (assertionId || scenarioId) {
        ({ testId } = decodeLocationOfDataId(assertionId || scenarioId));
    }
    if (testId) {
        ({ testPlanVersionId } = decodeLocationOfDataId(testId));
    }
    if (assertionResultId) {
        ({ scenarioResultId } = decodeLocationOfDataId(assertionResultId));
    }
    if (scenarioResultId) {
        ({ testResultId } = decodeLocationOfDataId(scenarioResultId));
    }
    if (testResultId) {
        ({ testPlanRunId } = decodeLocationOfDataId(testResultId));
    }

    let testPlan;
    let testPlanVersion;
    let testPlanReport;
    let testPlanRun;

    // Load data from database

    if (testPlanRunId) {
        if (preloaded?.testPlanReport) {
            testPlanReport = preloaded.testPlanReport;
            testPlanRun = testPlanReport.testPlanRuns.find(
                testPlanRun => testPlanRun.id == testPlanRunId
            );
        } else if (preloaded?.testPlanRun) {
            testPlanRun = preloaded.testPlanRun;
            testPlanReport = testPlanRun.testPlanReport;
        } else {
            testPlanRun = await getTestPlanRunById(testPlanRunId);
            testPlanReport = testPlanRun?.testPlanReport;
        }
        testPlanVersion = testPlanReport?.testPlanVersion;
    } else if (testPlanReportId) {
        if (preloaded?.testPlanReport) {
            testPlanReport = preloaded.testPlanReport;
        } else {
            testPlanReport = await getTestPlanReportById(testPlanReportId);
        }
        testPlanVersion = testPlanReport.testPlanVersion;
    } else if (testPlanVersionId) {
        if (preloaded?.testPlanReport) {
            testPlanVersion = preloaded.testPlanReport.testPlanVersion;
        } else if (preloaded?.testPlanVersion) {
            testPlanVersion = preloaded.testPlanVersion;
        } else {
            testPlanVersion = await getTestPlanVersionById(testPlanVersionId);
            console.log(testPlanVersion.testPlanReports);
        }
    } else if (testPlanId) {
        if (preloaded?.testPlan) {
            testPlan = preloaded.testPlan;
        } else {
            testPlan = await getTestPlanById(testPlanId);
        }
    }

    const failedToLoad = !testPlanVersion;
    if (failedToLoad) {
        throwFailedToLoadError({
            testPlanVersionId,
            testPlanRunId,
            locationOfData
        });
    }

    const at = testPlanReport?.at;
    const browser = testPlanReport?.browser;

    testPlan =
        testPlanVersion && !testPlan
            ? testPlanVersionTestPlanResolver(testPlanVersion)
            : null;

    // Populate data originating in the JSON part of the database

    let test;
    let scenario;
    let assertion;
    let testResult;
    let scenarioResult;
    let assertionResult;
    let atVersion;
    let browserVersion;

    if (testResultId) {
        const testResults = testsResultsResolver(testPlanRun);
        testResult = testResults.find(each => each.id === testResultId);
        if (!testResult) {
            throw new Error(
                `Failed to load the testResultId ${testResultId} because it ` +
                    `does not exist on the TestPlanRun with ID ${testPlanRunId}`
            );
        }
        ({ testId, atVersion, browserVersion } = testResult);
    }
    if (scenarioResultId) {
        scenarioResult = testResult.scenarioResults.find(
            each => each.id === scenarioResultId
        );
        scenarioId = scenarioResult.scenarioId;
    }
    if (assertionResultId) {
        assertionResult = scenarioResult.assertionResults.find(
            each => each.id === assertionResultId
        );
        assertionId = assertionResult.assertionId;
    }
    if (testId) {
        const tests = testsResolver(testPlanReport ?? testPlanVersion);
        test = tests.find(each => each.id === testId);
        if (!test) {
            throw new Error(
                `Failed to load the testId ${testId} because it does not ` +
                    `exist on the TestPlanVersion with ID ${testPlanVersionId}`
            );
        }
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
        idsContradict(locationOfData.testPlanId, testPlan) ||
        idsContradict(locationOfData.testPlanVersionId, testPlanVersion) ||
        idsContradict(locationOfData.testPlanReportId, testPlanReport) ||
        idsContradict(locationOfData.testPlanRunId, testPlanRun) ||
        idsContradict(locationOfData.atId, at) ||
        idsContradict(locationOfData.atVersionId, atVersion) ||
        idsContradict(locationOfData.browserId, browser) ||
        idsContradict(locationOfData.browserVersionId, browserVersion) ||
        idsContradict(locationOfData.testId, test) ||
        idsContradict(locationOfData.scenarioId, scenario) ||
        idsContradict(locationOfData.assertionId, assertion) ||
        idsContradict(locationOfData.testResultId, testResult) ||
        idsContradict(locationOfData.scenarioResultId, scenarioResult) ||
        idsContradict(locationOfData.assertionResultId, assertionResult)
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
        at,
        browser,
        atVersion,
        browserVersion,
        test,
        scenario,
        assertion,
        testResult,
        scenarioResult,
        assertionResult
    };
};

const throwFailedToLoadError = ({
    testPlanVersionId,
    testPlanRunId,
    locationOfData
}) => {
    const locationOfDataIdForTestPlanVersion = [
        'testId',
        'scenarioId',
        'assertionId'
    ].find(each => !!locationOfData[each]);

    const locationOfDataIdForTestPlanRun = [
        'testResultId',
        'scenarioResultId',
        'assertionResultId'
    ].find(each => !!locationOfData[each]);

    const locationOfDataInfo =
        `Using the IDs returned from the findOrCreateTestResult mutation should ` +
        `fix this error. For additional information see locationOfDataId.js.`;

    const undefinedInfo =
        `An undefined value might imply that you are using the wrong id, ` +
        `e.g. you are using a testResultId in place of a testId. `;

    if (locationOfDataIdForTestPlanVersion) {
        const idValue = locationOfData[locationOfDataIdForTestPlanVersion];
        const undefNote = testPlanVersionId === undefined ? undefinedInfo : '';
        throw new Error(
            `Failed to load the ${locationOfDataIdForTestPlanVersion} ` +
                `${idValue} because it encodes a reference to a ` +
                `testPlanVersion with ID ${testPlanVersionId} which does ` +
                `not exist. ${undefNote}${locationOfDataInfo}`
        );
    }
    if (locationOfDataIdForTestPlanRun) {
        const idValue = locationOfData[locationOfDataIdForTestPlanRun];
        const undefinedNote = testPlanRunId === undefined ? undefinedInfo : '';
        throw new Error(
            `Failed to load the ${locationOfDataIdForTestPlanRun} ` +
                `${idValue} because it encodes a reference to a testPlanRun ` +
                `with ID ${testPlanRunId} which does not exist. ` +
                `${undefinedNote}${locationOfDataInfo}`
        );
    }
    throw new Error(`Failed to load ${JSON.stringify(locationOfData)}`);
};
module.exports = populateData;
