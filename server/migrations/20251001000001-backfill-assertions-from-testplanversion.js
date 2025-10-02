'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Fetch all TestPlanVersions with their tests
    const testPlanVersions = await queryInterface.sequelize.query(
      'SELECT id, tests FROM "TestPlanVersion" WHERE tests IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Use batching to insert assertions to avoid memory issues
    const batchSize = 500;
    let assertionBatch = [];

    for (const testPlanVersion of testPlanVersions) {
      const tests = testPlanVersion.tests;

      if (!tests || !Array.isArray(tests)) {
        continue;
      }

      for (const test of tests) {
        if (!test.assertions || !Array.isArray(test.assertions)) {
          continue;
        }

        for (
          let assertionIndex = 0;
          assertionIndex < test.assertions.length;
          assertionIndex++
        ) {
          const assertion = test.assertions[assertionIndex];

          // Build the assertion record
          const assertionRecord = {
            testPlanVersionId: testPlanVersion.id,
            testId: test.id,
            assertionIndex: assertionIndex,
            priority: assertion.priority || '',
            text: assertion.text || null,
            rawAssertionId: assertion.rawAssertionId || null,
            assertionStatement: assertion.assertionStatement || null,
            assertionPhrase: assertion.assertionPhrase || null,
            assertionExceptions: assertion.assertionExceptions
              ? JSON.stringify(assertion.assertionExceptions)
              : null,
            encodedId: assertion.id,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          assertionBatch.push(assertionRecord);

          // Insert in batches
          if (assertionBatch.length >= batchSize) {
            await queryInterface.bulkInsert('Assertion', assertionBatch);
            assertionBatch = [];
          }
        }
      }
    }

    // Insert remainder
    if (assertionBatch.length > 0) {
      await queryInterface.bulkInsert('Assertion', assertionBatch);
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.bulkDelete('Assertion', null, {});
    } catch (e) {
      console.error('Error clearing Assertion table:', e);
    }
  }
};
