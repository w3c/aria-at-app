const me = require('./meResolver');
const users = require('./usersResolver');
const ats = require('./atsResolver');
const browsers = require('./browsersResolver');
const testPlans = require('./testPlansResolver');
const testPlan = require('./testPlanResolver');
// const testPlanVersions = require('./testPlanVersionsResolver');
const testPlanReport = require('./testPlanReportResolver');
const testPlanReports = require('./testPlanReportsResolver');
// const testPlanRun = require('./testPlanRunResolver');
const findOrCreateTestPlanReport = require('./findOrCreateTestPlanReportResolver');
const mutateTestPlanReport = require('./mutateTestPlanReportResolver');
const mutateTestPlanRun = require('./mutateTestPlanRunResolver');
const populateData = require('./populateDataResolver');
const User = require('./User');
const At = require('./At');
const Browser = require('./Browser');
const TestPlanVersion = require('./TestPlanVersion');
const TestPlanReport = require('./TestPlanReport');
const TestPlanReportOperations = require('./TestPlanReportOperations');
const TestPlanRunOperations = require('./TestPlanRunOperations');
const TestPlanRun = require('./TestPlanRun');
const PopulatedData = require('./PopulatedData');

const resolvers = {
    Query: {
        me,
        users,
        ats,
        browsers,
        testPlan,
        testPlans,
        testPlanReport,
        testPlanReports,
        populateData
    },
    Mutation: {
        testPlanReport: mutateTestPlanReport,
        testPlanRun: mutateTestPlanRun,
        findOrCreateTestPlanReport
    },
    At,
    Browser,
    User,
    TestPlanVersion,
    TestPlanReport,
    TestPlanRun,
    TestPlanReportOperations,
    TestPlanRunOperations,
    PopulatedData
};

module.exports = resolvers;
