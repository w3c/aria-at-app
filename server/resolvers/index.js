const me = require('./meResolver');
const ats = require('./atsResolver');
const browsers = require('./browsersResolver');
const testPlans = require('./testPlanVersionsResolver');
const testPlanReport = require('./testPlanReportResolver');
const testPlanReports = require('./testPlanReportsResolver');
const findOrCreateTestPlanReport = require('./findOrCreateTestPlanReportResolver');
const mutateTestPlanReport = require('./mutateTestPlanReportResolver');
const populateData = require('./populateDataResolver');
const At = require('./At');
const Browser = require('./Browser');
const User = require('./User');
const TestPlanVersion = require('./TestPlanVersion');
const TestPlanReport = require('./TestPlanReport');
const TestPlanReportOperations = require('./TestPlanReportOperations');
const TestPlanRun = require('./TestPlanRun');
const PopulatedData = require('./PopulatedData');

const resolvers = {
    Query: {
        me,
        ats,
        browsers,
        testPlans,
        testPlanReport,
        testPlanReports,
        populateData
    },
    Mutation: {
        testPlanReport: mutateTestPlanReport,
        findOrCreateTestPlanReport
    },
    At,
    Browser,
    User,
    TestPlanVersion,
    TestPlanReport,
    TestPlanReportOperations,
    TestPlanRun,
    PopulatedData,
    Test: { __resolveType: () => null },
    Assertion: { __resolveType: () => null },
    PassThrough: { __resolveType: () => null }
};

module.exports = resolvers;
