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
const latestTestPlanVersion = require('./latestTestPlanVersionResolver');
const reviewerStatus = require('./reviewerStatusResolver');
const reviewerStatuses = require('./reviewerStatusesResolver');
const testPlanRun = require('./testPlanRunResolver');
const testPlanRuns = require('./testPlanRunsResolver');
const vendors = require('./vendorsResolver');
const vendor = require('./vendorResolver');
const vendorByName = require('./vendorByNameResolver');
const createTestPlanReport = require('./createTestPlanReportResolver');
const addViewer = require('./addViewerResolver');
const mutateAt = require('./mutateAtResolver');
const mutateAtVersion = require('./mutateAtVersionResolver');
const mutateBrowser = require('./mutateBrowserResolver');
const mutateTestPlanReport = require('./mutateTestPlanReportResolver');
const mutateTestPlanRun = require('./mutateTestPlanRunResolver');
const mutateTestResult = require('./mutateTestResultResolver');
const mutateTestPlanVersion = require('./mutateTestPlanVersionResolver');
const mutateCollectionJob = require('./mutateCollectionJobResolver');
const updateMe = require('./updateMe');
const populateData = require('./populateDataResolver');
const collectionJob = require('./collectionJobResolver');
const collectionJobs = require('./collectionJobsResolver');
const updateCollectionJob = require('./updateCollectionJobResolver');
const deleteCollectionJob = require('./deleteCollectionJobResolver');
const scheduleCollectionJob = require('./scheduleCollectionJobResolver');
const restartCollectionJob = require('./restartCollectionJobResolver');
const collectionJobByTestPlanRunId = require('./collectionJobByTestPlanRunIdResolver');
const User = require('./User');
const AtOperations = require('./AtOperations');
const AtVersionOperations = require('./AtVersionOperations');
const BrowserOperations = require('./BrowserOperations');
const TestPlan = require('./TestPlan');
const TestPlanVersion = require('./TestPlanVersion');
const TestPlanReport = require('./TestPlanReport');
const TestPlanReportOperations = require('./TestPlanReportOperations');
const TestPlanRunOperations = require('./TestPlanRunOperations');
const TestResultOperations = require('./TestResultOperations');
const TestPlanVersionOperations = require('./TestPlanVersionOperations');
const CollectionJobOperations = require('./CollectionJobOperations');
const CollectionJob = require('./CollectionJob');
const TestPlanRun = require('./TestPlanRun');
const Test = require('./Test');
const ScenarioResult = require('./ScenarioResult');
const AtVersion = require('./AtVersion');
const createCollectionJobsFromPreviousAtVersion = require('./createCollectionJobsFromPreviousAtVersionResolver');
const rerunnableReports = require('./rerunnableReportsResolver');
const { updateEvents, updateEvent } = require('./UpdateEvent');

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
    latestTestPlanVersion,
    testPlanReport,
    testPlanReports,
    testPlanRun,
    testPlanRuns,
    populateData,
    collectionJob,
    collectionJobs,
    collectionJobByTestPlanRunId,
    reviewerStatus,
    reviewerStatuses,
    vendors,
    vendor,
    vendorByName,
    rerunnableReports,
    updateEvents,
    updateEvent
  },
  Mutation: {
    at: mutateAt,
    atVersion: mutateAtVersion,
    browser: mutateBrowser,
    testPlanReport: mutateTestPlanReport,
    testPlanRun: mutateTestPlanRun,
    testResult: mutateTestResult,
    testPlanVersion: mutateTestPlanVersion,
    collectionJob: mutateCollectionJob,
    createTestPlanReport,
    updateMe,
    addViewer,
    updateCollectionJob,
    deleteCollectionJob,
    scheduleCollectionJob,
    restartCollectionJob,
    createCollectionJobsFromPreviousAtVersion
  },
  AtOperations,
  AtVersionOperations,
  BrowserOperations,
  CollectionJob,
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
  TestPlanVersionOperations,
  CollectionJobOperations,
  AtVersion
};

module.exports = resolvers;
