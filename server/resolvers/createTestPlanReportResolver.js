const { AuthenticationError, UserInputError } = require('apollo-server-errors');
const {
  createTestPlanReport,
  getTestPlanReportByQuery
} = require('../models/services/TestPlanReportService');
const populateData = require('../services/PopulatedData/populateData');
const processCopiedReports = require('./helpers/processCopiedReports');

const createTestPlanReportResolver = async (_, { input }, context) => {
  const { user, transaction } = context;

  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  if (!(input.exactAtVersionId || input.minimumAtVersionId)) {
    throw new UserInputError(
      'Missing either an exact AT version or a minimum AT version'
    );
  }

  // Pull back report from TestPlanVersion in advanced phase and run through processCopiedReports if not deprecated
  const { copyResultsFromTestPlanVersionId, ...values } = input;

  let testPlanReport;
  let alreadyExisted = false;
  const existingTestPlanReport = await getTestPlanReportByQuery({
    where: values,
    transaction
  });

  if (copyResultsFromTestPlanVersionId) {
    const { updatedTestPlanReports } = await processCopiedReports({
      oldTestPlanVersionId: copyResultsFromTestPlanVersionId,
      newTestPlanVersionId: input.testPlanVersionId,
      newTestPlanReports: [],
      atBrowserCombinationsToInclude: [
        { atId: input.atId, browserId: input.browserId }
      ],
      context
    });

    if (updatedTestPlanReports?.length) {
      // Expecting only to get back the single requested combination
      testPlanReport = updatedTestPlanReports[0];
      // If processCopiedReports returned reports, they already existed
      alreadyExisted = true;
    } else {
      if (existingTestPlanReport) {
        testPlanReport = existingTestPlanReport;
        alreadyExisted = true;
      } else {
        testPlanReport = await createTestPlanReport({
          values,
          transaction
        });
      }
    }
  } else {
    if (existingTestPlanReport) {
      testPlanReport = existingTestPlanReport;
      alreadyExisted = true;
    } else testPlanReport = await createTestPlanReport({ values, transaction });
  }

  const locationOfData = { testPlanReportId: testPlanReport.id };
  const preloaded = { testPlanReport };
  const populatedData = await populateData(locationOfData, {
    preloaded,
    context
  });

  return {
    populatedData,
    alreadyExisted
  };
};

module.exports = createTestPlanReportResolver;
