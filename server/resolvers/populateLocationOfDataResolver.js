const {
    getTestPlanVersionById
} = require('../models/services/TestPlanVersionService');
const {
    getTestPlanReportById
} = require('../models/services/TestPlanReportService');
const {
    getTestPlanRunById
} = require('../models/services/TestPlanReportService');

const populateLocationOfDataResolver = async (_, { locationOfData }) => {
    const {
        testPlan: testPlanId,
        testPlanVersion: testPlanVersionId,
        testPlanReport: testPlanReportId,
        testPlanRun: testPlanRunId,
        test: testIndex,
        passThrough: passThroughIndex,
        testResult: testResultIndex,
        passThroughResult: passThroughResultIndex
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
        testPlanReport = testPlanRun.testPlanReport;
        testPlanVersion = testPlanReport.testPlanVersion;
    } else if (testPlanReportId) {
        testPlanReport = await getTestPlanReportById(testPlanReportId);
        testPlanVersion = testPlanReport.testPlanVersion;
    } else if (testPlanVersionId) {
        testPlanVersion = await getTestPlanVersionById(testPlanVersionId);
    }

    if (!testPlanVersion) {
        // TODO: This error can be removed when a TestPlan table is added.
        throw new Error(
            'LocationOfData without a test plan version is not yet implemented.'
        );
    }
    testPlan = { id: testPlanVersion.metadata.directory };

    const idsContradict = (provided, found) => {
        return provided && provided.toString() !== found.id.toString();
    };
    if (
        idsContradict(testPlanId, testPlan) ||
        idsContradict(testPlanVersionId, testPlanVersion) ||
        idsContradict(testPlanReportId, testPlanReport) ||
        idsContradict(testPlanRunId, testPlanRun)
    ) {
        throw new Error(
            'You provided IDs for both a parent and child model, implying a' +
                'relationship, but no relationship was found'
        );
    }

    return {
        locationOfData: {
            testPlan: testPlan && testPlan.id,
            testPlanVersion: testPlanVersion && testPlanVersion.id,
            testPlanReport: testPlanReport && testPlanReport.id,
            testPlanRun: testPlanRun && testPlanRun.id
        },
        testPlan,
        testPlanVersion,
        testPlanReport,
        testPlanRun
    };
};

module.exports = populateLocationOfDataResolver;
