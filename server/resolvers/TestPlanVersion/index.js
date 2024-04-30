const testPlan = require('./testPlanResolver');
const gitMessage = require('./gitMessageResolver');
const tests = require('./testsResolver');
const testPlanReports = require('./testPlanReportsResolver');
const recommendedPhaseTargetDate = require('./recommendedPhaseTargetDateResolver');
const testPlanReportStatuses = require('./testPlanReportStatusesResolver');

const TestPlanVersion = {
    testPlan,
    gitMessage,
    tests,
    testPlanReports,
    recommendedPhaseTargetDate,
    testPlanReportStatuses
};

module.exports = TestPlanVersion;
