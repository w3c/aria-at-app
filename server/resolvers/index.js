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
const addViewer = require('./addViewerResolver');
const mutateAt = require('./mutateAtResolver');
const mutateAtVersion = require('./mutateAtVersionResolver');
const mutateBrowser = require('./mutateBrowserResolver');
const mutateRequiredReport = require('./mutateRequiredReportResolver');
const mutateTestPlanReport = require('./mutateTestPlanReportResolver');
const mutateTestPlanRun = require('./mutateTestPlanRunResolver');
const mutateTestResult = require('./mutateTestResultResolver');
const mutateTestPlanVersion = require('./mutateTestPlanVersionResolver');
const updateMe = require('./updateMe');
const populateData = require('./populateDataResolver');
const User = require('./User');
const AtOperations = require('./AtOperations');
const AtVersionOperations = require('./AtVersionOperations');
const BrowserOperations = require('./BrowserOperations');
<<<<<<< HEAD
const RequiredReportOperations = require('./RequiredReportOperations');
=======
const TestPlan = require('./TestPlan');
>>>>>>> update-database-impl
const TestPlanVersion = require('./TestPlanVersion');
const TestPlanReport = require('./TestPlanReport');
const TestPlanReportOperations = require('./TestPlanReportOperations');
const TestPlanRunOperations = require('./TestPlanRunOperations');
const TestResultOperations = require('./TestResultOperations');
const TestPlanVersionOperations = require('./TestPlanVersionOperations');
const TestPlanRun = require('./TestPlanRun');
const Test = require('./Test');
const ScenarioResult = require('./ScenarioResult');

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
        at: mutateAt,
        atVersion: mutateAtVersion,
        browser: mutateBrowser,
        requiredReport: mutateRequiredReport,
        testPlanReport: mutateTestPlanReport,
        testPlanRun: mutateTestPlanRun,
        testResult: mutateTestResult,
        testPlanVersion: mutateTestPlanVersion,
        findOrCreateTestPlanReport,
        updateMe,
        addViewer
    },
    AtOperations,
    AtVersionOperations,
    BrowserOperations,
    RequiredReportOperations,
    User,
    TestPlan,
    TestPlanVersion,
    TestPlanReport,
    TestPlanRun,
    Test,
    ScenarioResult,
    TestPlanReportOperations,
    TestPlanRunOperations,
    TestResultOperations,
    TestPlanVersionOperations
};

module.exports = resolvers;
