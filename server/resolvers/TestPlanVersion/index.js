const testPlan = require('./testPlanResolver');
const gitMessage = require('./gitMessageResolver');
const tests = require('./testsResolver');
const testPlanReports = require('./testPlanReportsResolver');
const recommendedPhaseTargetDate = require('./recommendedPhaseTargetDateResolver');
const testPlanReportStatuses = require('./testPlanReportStatusesResolver');
const earliestAtVersion = require('./earliestAtVersionResolver');

const TestPlanVersion = {
    testPlan,
    gitMessage,
    tests,
    recommendedPhaseTargetDate,
    testPlanReports,
    testPlanReportStatuses,
    earliestAtVersion
};

module.exports = TestPlanVersion;
