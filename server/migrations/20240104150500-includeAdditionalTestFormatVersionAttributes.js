'use strict';

const { regenerateResultsAndRecalculateHashes } = require('./utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const updateV1TestPlanVersionsToIncludeTestFormatVersion =
      async transaction => {
        // No testFormatVersion indicates this is v1 TestPlanVersion data
        const testPlanVersions = await queryInterface.sequelize.query(
          `SELECT id, metadata FROM "TestPlanVersion" WHERE metadata->>'testFormatVersion' IS NULL`,
          {
            type: Sequelize.QueryTypes.SELECT,
            transaction
          }
        );

        await Promise.all(
          testPlanVersions.map(async ({ id, metadata }) => {
            const updatedMetadata = JSON.stringify({
              ...metadata,
              testFormatVersion: 1
            });
            await queryInterface.sequelize.query(
              `UPDATE "TestPlanVersion" SET metadata = ? WHERE id = ?`,
              { replacements: [updatedMetadata, id], transaction }
            );
          })
        );
      };

    const updateTestPlanVersionTestsToIncludeTestFormatVersion =
      async transaction => {
        const testPlanVersions = await queryInterface.sequelize.query(
          `SELECT id, tests, metadata FROM "TestPlanVersion"`,
          {
            type: Sequelize.QueryTypes.SELECT,
            transaction
          }
        );
        await Promise.all(
          testPlanVersions.map(async ({ id, tests, metadata }) => {
            const testFormatVersion = metadata.testFormatVersion;
            const updatedTests = JSON.stringify(
              tests.map(test => ({ ...test, testFormatVersion }))
            );
            await queryInterface.sequelize.query(
              `UPDATE "TestPlanVersion" SET tests = ? WHERE id = ?`,
              { replacements: [updatedTests, id], transaction }
            );
          })
        );
      };

    return queryInterface.sequelize.transaction(async transaction => {
      // Include testFormatVersion inside TestPlanVersion.metadata for v1 test plan versions
      await updateV1TestPlanVersionsToIncludeTestFormatVersion(transaction);

      // Include testFormatVersion for each test inside TestPlanVersion.tests
      await updateTestPlanVersionTestsToIncludeTestFormatVersion(transaction);

      // Recalculate the hashes
      await regenerateResultsAndRecalculateHashes(queryInterface, transaction);
    });
  }
};
