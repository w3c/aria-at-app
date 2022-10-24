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
const mutateTestPlanReport = require('./mutateTestPlanReportResolver');
const mutateTestPlanRun = require('./mutateTestPlanRunResolver');
const mutateTestResult = require('./mutateTestResultResolver');
const updateMe = require('./updateMe');
const populateData = require('./populateDataResolver');
const User = require('./User');
const AtOperations = require('./AtOperations');
const AtVersionOperations = require('./AtVersionOperations');
const BrowserOperations = require('./BrowserOperations');
const TestPlanVersion = require('./TestPlanVersion');
const TestPlanReport = require('./TestPlanReport');
const TestPlanReportOperations = require('./TestPlanReportOperations');
const TestPlanRunOperations = require('./TestPlanRunOperations');
const TestResultOperations = require('./TestResultOperations');
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
        testPlanReport: mutateTestPlanReport,
        testPlanRun: mutateTestPlanRun,
        testResult: mutateTestResult,
        findOrCreateTestPlanReport,
        updateMe,
        addViewer
    },
    AtOperations,
    AtVersionOperations,
    BrowserOperations,
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
