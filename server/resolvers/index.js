const me = require('./meResolver');
const testPlans = require('./testPlanVersionsResolver');
const testPlanReport = require('./testPlanReportResolver');
const mutateTestPlanReport = require('./mutateTestPlanReportResolver');
const User = require('./User');
const TestPlanVersion = require('./TestPlanVersion');
const TestPlanReport = require('./TestPlanReport');
const TestPlanReportOperations = require('./TestPlanReportOperations');
const TestPlanRun = require('./TestPlanRun');

const resolvers = {
    Query: {
        me,
        testPlans,
        testPlanReport
    },
    Mutation: {
        testPlanReport: mutateTestPlanReport
    },
    User,
    TestPlanVersion,
    TestPlanReport,
    TestPlanReportOperations,
    TestPlanRun
};

module.exports = resolvers;
