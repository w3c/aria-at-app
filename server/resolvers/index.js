const me = require('./meResolver');
const ats = require('./atsResolver');
const browsers = require('./browsersResolver');
const testPlans = require('./testPlanVersionsResolver');
const testPlanReport = require('./testPlanReportResolver');
const testPlanReports = require('./TestPlanReportsResolver');
const findOrCreateTestPlanReport = require('./findOrCreateTestPlanReportResolver');
const mutateTestPlanReport = require('./mutateTestPlanReportResolver');
const populateLocationOfData = require('./populateLocationOfDataResolver');
const TestPlanVersion = require('./TestPlanVersion');
const TestPlanReport = require('./TestPlanReport');
const TestPlanReportOperations = require('./TestPlanReportOperations');
const TestPlanReportOperationResult = require('./TestPlanReportOperationResult');
const TestPlanRun = require('./TestPlanRun');

const resolvers = {
    Query: {
        me,
        ats,
        browsers,
        testPlans,
        testPlanReport,
        testPlanReports,
        populateLocationOfData
    },
    Mutation: {
        testPlanReport: mutateTestPlanReport,
        findOrCreateTestPlanReport
    },
    TestPlanVersion,
    TestPlanReport,
    TestPlanReportOperations,
    TestPlanReportOperationResult,
    TestPlanRun
};

module.exports = resolvers;
