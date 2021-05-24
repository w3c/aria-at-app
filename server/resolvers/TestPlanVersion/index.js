const testPlanReports = require('./testPlanReportsResolver');
const testCount = require('./testCountResolver');
const gitSha = require('./gitShaResolver');
const gitMessage = require('./gitMessageResolver');

const TestPlanVersion = {
    testPlanReports,
    testCount,
    gitSha,
    gitMessage
};

module.exports = TestPlanVersion;
