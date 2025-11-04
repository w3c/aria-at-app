const {
  getAssertionsByTestId
} = require('../../models/services/AssertionService');

const assertionsResolver = async (test, { priority }, context) => {
  const { transaction } = context;
  let assertions = test.assertions;
  // TODO: Remove the deprecated JSONB fallback for assertions
  // Try to fetch from Assertion table
  try {
    const assertionsFromDb = await getAssertionsByTestId({
      testId: test.id,
      transaction
    });

    if (assertionsFromDb && assertionsFromDb.length > 0) {
      // Convert database assertions to the format expected by GraphQL
      assertions = assertionsFromDb.map(assertionFromDb => ({
        id: assertionFromDb.encodedId,
        priority: assertionFromDb.priority,
        // Use assertionStatement as fallback for v2 format when text is null
        text: assertionFromDb.text || assertionFromDb.assertionStatement || '',
        rawAssertionId: assertionFromDb.rawAssertionId,
        assertionStatement: assertionFromDb.assertionStatement,
        assertionPhrase: assertionFromDb.assertionPhrase,
        assertionExceptions: assertionFromDb.assertionExceptions
      }));
    }
  } catch (e) {
    // If database lookup fails, fallback to JSONB
    console.warn(
      `Failed to fetch assertions from database for test ${test.id}: ${e.message}`
    );
  }

  if (!priority) return assertions;
  return assertions.filter(assertion => assertion.priority === priority);
};

module.exports = assertionsResolver;
