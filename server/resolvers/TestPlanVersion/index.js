const testPlan = require('./testPlanResolver');
const gitMessage = require('./gitMessageResolver');
const tests = require('./testsResolver');
const testPlanReports = require('./testPlanReportsResolver');
const recommendedPhaseTargetDate = require('./recommendedPhaseTargetDateResolver');
const earliestAtVersion = require('./earliestAtVersionResolver');
const trendReports = require('./trendReportsResolver');

const TestPlanVersion = {
    testPlan,
    gitMessage,
    tests,
    testPlanReports,
    recommendedPhaseTargetDate,
    earliestAtVersion,
    trendReports
};

module.exports = TestPlanVersion;
