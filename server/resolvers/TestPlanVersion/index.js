const testPlan = require('./testPlanResolver');
const gitMessage = require('./gitMessageResolver');
const tests = require('./testsResolver');
const testPlanReports = require('./testPlanReportsResolver');
const recommendedPhaseTargetDate = require('./recommendedPhaseTargetDateResolver');
const earliestAtVersion = require('./earliestAtVersionResolver');

const TestPlanVersion = {
    testPlan,
    gitMessage,
    tests,
    testPlanReports,
    recommendedPhaseTargetDate,
    earliestAtVersion
};

module.exports = TestPlanVersion;
