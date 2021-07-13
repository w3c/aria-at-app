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
    TestPlanVersion,
    TestPlanReport,
    TestPlanReportOperations,
    TestPlanRun,
    PopulatedData
};

module.exports = resolvers;
