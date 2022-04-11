const me = require('./meResolver');
const users = require('./usersResolver');
const ats = require('./atsResolver');
const browsers = require('./browsersResolver');
const testPlans = require('./testPlansResolver');
const testPlan = require('./testPlanResolver');
const testPlanReport = require('./testPlanReportResolver');
const testPlanReports = require('./testPlanReportsResolver');
const testPlanVersion = require('./testPlanVersionResolver');
const testPlanVersions = require('./testPlanVersionsResolver');
const testPlanRun = require('./testPlanRunResolver');
const findOrCreateTestPlanReport = require('./findOrCreateTestPlanReportResolver');
const mutateTestPlanReport = require('./mutateTestPlanReportResolver');
const mutateTestPlanRun = require('./mutateTestPlanRunResolver');
const mutateTestResult = require('./mutateTestResultResolver');
const updateMe = require('./updateMe');
const populateData = require('./populateDataResolver');
const User = require('./User');
const At = require('./At');
const Browser = require('./Browser');
const TestPlanVersion = require('./TestPlanVersion');
const TestPlanReport = require('./TestPlanReport');
const TestPlanReportOperations = require('./TestPlanReportOperations');
const TestPlanRunOperations = require('./TestPlanRunOperations');
const TestResultOperations = require('./TestResultOperations');
const TestPlanRun = require('./TestPlanRun');
const Test = require('./Test');
const ScenarioResult = require('./ScenarioResult');
const { createAtVersionResolver } = require('./atResolver');

const resolvers = {
    Query: {
        me,
        users,
        ats,
        browsers,
        testPlan,
        testPlans,
        testPlanVersion,
        testPlanVersions,
        testPlanReport,
        testPlanReports,
        testPlanRun,
        populateData
    },
    Mutation: {
        testPlanReport: mutateTestPlanReport,
        testPlanRun: mutateTestPlanRun,
        testResult: mutateTestResult,
        findOrCreateTestPlanReport,
        updateMe,
        createAtVersion: createAtVersionResolver
    },
    At,
    Browser,
    User,
    TestPlanVersion,
    TestPlanReport,
    TestPlanRun,
    Test,
    ScenarioResult,
    TestPlanReportOperations,
    TestPlanRunOperations,
    TestResultOperations
};

module.exports = resolvers;
