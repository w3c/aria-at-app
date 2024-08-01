const { Sequelize } = require('sequelize');
const getGraphQLContext = require('../../graphql-context');
const populateData = require('../../services/PopulatedData/populateData');
const runnableTestsResolver = require('../../resolvers/TestPlanReport/runnableTestsResolver');
const finalizedTestResultsResolver = require('../../resolvers/TestPlanReport/finalizedTestResultsResolver');
const { getMetrics } = require('shared');
const {
  updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');

/**
 * Recalculate TestPlanReport.metrics
 * @param queryInterface - The Sequelize.QueryInterface object.
 * @param transaction - The Sequelize.Transaction object.
 * See {@https://sequelize.org/api/v6/class/src/sequelize.js~sequelize#instance-method-transaction}
 * @returns {Promise<void>}
 */
const recalculateMetrics = async (queryInterface, transaction) => {
  const context = getGraphQLContext({ req: { transaction } });

  const testPlanReports = await queryInterface.sequelize.query(
    `SELECT id, metrics FROM "TestPlanReport"`,
    {
      type: Sequelize.QueryTypes.SELECT,
      transaction
    }
  );

  for (const testPlanReport of testPlanReports) {
    const { testPlanReport: testPlanReportPopulated } = await populateData(
      { testPlanReportId: testPlanReport.id },
      { context }
    );
    const runnableTests = runnableTestsResolver(
      testPlanReportPopulated,
      null,
      context
    );
    const finalizedTestResults = await finalizedTestResultsResolver(
      testPlanReportPopulated,
      null,
      context
    );
    const metrics = getMetrics({
      testPlanReport: {
        ...testPlanReportPopulated,
        finalizedTestResults,
        runnableTests
      }
    });
    await updateTestPlanReportById({
      id: testPlanReportPopulated.id,
      values: {
        metrics: {
          ...testPlanReportPopulated.metrics,
          ...metrics
        }
      },
      transaction
    });
  }
};

module.exports = recalculateMetrics;
