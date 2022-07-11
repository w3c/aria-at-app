const {
    getTestPlanVersionTestsForAtCount
} = require('../../models/services/TestPlanVersionService');

const runnableTestsLengthResolver = async testPlanReport => {
    const isTestPlanVersion = !!testPlanReport.tests;
    const testPlanReportResult = isTestPlanVersion ? null : testPlanReport;
    const testPlanVersion = isTestPlanVersion
        ? testPlanReport
        : testPlanReportResult.testPlanVersion;

    return await getTestPlanVersionTestsForAtCount(
        testPlanVersion.id,
        testPlanVersion.directory,
        testPlanReport.atId
    );
};

module.exports = runnableTestsLengthResolver;
