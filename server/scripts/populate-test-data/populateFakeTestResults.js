const { gql } = require('apollo-server-core');
const {
  getAtVersionByQuery
} = require('../../models/services/AtVersionService');
const {
  getBrowserVersionByQuery
} = require('../../models/services/BrowserService');
const { query, mutate } = require('../../tests/util/graphql-test-utilities');

const FAKE_RESULT_CONFLICTS_OPTIONS = {
  SINGLE: 1,
  ALL: Infinity
};

/**
 *
 * @param {number} testPlanRunId
 * @param {string['completeAndPassing' |
 * 'completeAndFailingDueToIncorrectAssertions' |
 * 'completeAndFailingDueToNoOutputAssertions' |
 * 'completeAndFailingDueToUnexpectedBehaviors' |
 * 'completeAndFailingDueToMultiple' |
 * 'incompleteAndEmpty' |
 * 'incompleteAndPassing' |
 * 'incompleteAndFailingDueToIncorrectAssertions' |
 * 'incompleteAndFailingDueToNoOutputAssertions' |
 * 'incompleteAndFailingDueToUnexpectedBehaviors' |
 * 'incompleteAndFailingDueToMultiple']} fakeTestResultTypes
 * @param {import('sequelize').Transaction} transaction
 * @param {number} numFakeTestResultConflicts
 * @returns {Promise<void>}
 */
const populateFakeTestResults = async (
  testPlanRunId,
  fakeTestResultTypes,
  {
    transaction,
    atVersionId = null,
    numFakeTestResultConflicts = FAKE_RESULT_CONFLICTS_OPTIONS.SINGLE
  }
) => {
  const {
    populateData: { testPlanReport }
  } = await query(
    gql`
      query {
        populateData(locationOfData: { testPlanRunId: ${testPlanRunId} }) {
          testPlanReport {
            at {
              id
            }
            browser {
              id
            }
            runnableTests {
              id
            }
          }
        }
      }
    `,
    { transaction }
  );

  let index = 0;

  for (const fakeTestResultType of fakeTestResultTypes) {
    // eslint-disable-next-line no-console
    console.info(
      'Populating sample for TestPlanRun',
      testPlanRunId,
      'TestResult',
      index
    );

    switch (fakeTestResultType) {
      case null:
        break;
      case 'completeAndPassing':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'passing',
          submit: true,
          transaction,
          atVersionId
        });
        break;
      case 'completeAndFailingDueToIncorrectAssertions':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToIncorrectAssertions',
          submit: true,
          numFakeTestResultConflicts,
          transaction,
          atVersionId
        });
        break;
      case 'completeAndFailingDueToNoOutputAssertions':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToNoOutputAssertions',
          submit: true,
          numFakeTestResultConflicts,
          transaction,
          atVersionId
        });
        break;
      case 'completeAndFailingDueToUnexpectedBehaviors':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToUnexpectedBehaviors',
          submit: true,
          numFakeTestResultConflicts,
          transaction,
          atVersionId
        });
        break;
      case 'completeAndFailingDueToMultiple':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToMultiple',
          submit: true,
          numFakeTestResultConflicts,
          transaction,
          atVersionId
        });
        break;
      case 'incompleteAndEmpty':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'empty',
          submit: false,
          transaction,
          atVersionId
        });
        break;
      case 'incompleteAndPassing':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'passing',
          submit: false,
          transaction,
          atVersionId
        });
        break;
      case 'incompleteAndFailingDueToIncorrectAssertions':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToIncorrectAssertions',
          submit: false,
          numFakeTestResultConflicts,
          transaction,
          atVersionId
        });
        break;
      case 'incompleteAndFailingDueToNoOutputAssertions':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToNoOutputAssertions',
          submit: false,
          numFakeTestResultConflicts,
          transaction,
          atVersionId
        });
        break;
      case 'incompleteAndFailingDueToUnexpectedBehaviors':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToUnexpectedBehaviors',
          submit: false,
          numFakeTestResultConflicts,
          transaction,
          atVersionId
        });
        break;
      case 'incompleteAndFailingDueToMultiple':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToMultiple',
          submit: false,
          numFakeTestResultConflicts,
          transaction,
          atVersionId
        });
        break;
      default:
        throw new Error(
          `Invalid fake test result type '${fakeTestResultType}'`
        );
    }

    index += 1;
  }

  // The following makes it so that fake tests are made for
  // all possible tests that can be completed for any given
  // test plan. Therefore, there will be no missing or skipped
  // fake tests in the database.
  if (testPlanReport.runnableTests.length !== fakeTestResultTypes.length) {
    for (let i = index; i < testPlanReport.runnableTests.length; i += 1) {
      await getFake({
        testPlanReport,
        testPlanRunId,
        index: i,
        fakeTestResultType: 'passing',
        submit: true,
        transaction
      });
    }
  }
};

const getFake = async ({
  testPlanReport,
  testPlanRunId,
  index,
  fakeTestResultType,
  submit,
  numFakeTestResultConflicts,
  transaction,
  atVersionId = null
}) => {
  const testId = testPlanReport.runnableTests[index].id;

  if (!atVersionId) {
    const atVersion = await getAtVersionByQuery({
      where: { atId: testPlanReport.at.id },
      pagination: {
        order: [
          ['name', 'DESC'],
          ['releasedAt', 'DESC']
        ]
      },
      transaction
    });
    atVersionId = atVersion.id;
  }

  const browserVersion = await getBrowserVersionByQuery({
    where: { browserId: testPlanReport.browser.id },
    transaction
  });

  const {
    testPlanRun: {
      findOrCreateTestResult: { testResult: baseTestResult }
    }
  } = await mutate(
    gql`
      mutation {
        testPlanRun(id: ${testPlanRunId}) {
          findOrCreateTestResult(
            testId: "${testId}",
            atVersionId: "${atVersionId}",
            browserVersionId: "${browserVersion.id}"
          ) {
            testResult {
              id
              scenarioResults {
                id
                output
                assertionResults {
                  id
                  passed
                }
              }
            }
          }
        }
      }
    `,
    { transaction }
  );

  const getPassing = () => ({
    ...baseTestResult,
    atVersionId: atVersionId,
    browserVersionId: browserVersion.id,
    scenarioResults: baseTestResult.scenarioResults.map(scenarioResult => ({
      ...scenarioResult,
      output: 'automatically seeded sample output',
      assertionResults: scenarioResult.assertionResults.map(
        assertionResult => ({
          ...assertionResult,
          passed: true
        })
      ),
      unexpectedBehaviors: []
    }))
  });

  const testResult = getPassing();

  const applyResult = (scenarioResult, type) => {
    switch (type) {
      case 'failingDueToIncorrectAssertions':
        scenarioResult.assertionResults[0].passed = false;
        scenarioResult.assertionResults[0].failedReason = 'INCORRECT_OUTPUT';
        break;
      case 'failingDueToNoOutputAssertions':
        scenarioResult.assertionResults[0].passed = false;
        scenarioResult.assertionResults[0].failedReason = 'NO_OUTPUT';
        break;
      case 'failingDueToUnexpectedBehaviors':
        scenarioResult.unexpectedBehaviors.push({
          id: 'OTHER',
          impact: 'MODERATE',
          details: 'Seeded other unexpected behavior'
        });
        break;
      case 'failingDueToMultiple':
        scenarioResult.assertionResults[0].passed = false;
        scenarioResult.assertionResults[0].failedReason = 'INCORRECT_OUTPUT';
        scenarioResult.unexpectedBehaviors.push(
          { id: 'EXCESSIVELY_VERBOSE', impact: 'MODERATE', details: 'N/A' },
          {
            id: 'OTHER',
            impact: 'SEVERE',
            details: 'Seeded other unexpected behavior'
          }
        );
        break;
      default:
        throw new Error();
    }
  };

  if (fakeTestResultType === 'empty') {
    return;
  } else if (fakeTestResultType === 'passing') {
    // Do nothing
  } else {
    const setResult = scenarioResult =>
      applyResult(scenarioResult, fakeTestResultType);

    if (numFakeTestResultConflicts > 0) {
      testResult.scenarioResults
        .slice(0, numFakeTestResultConflicts)
        .forEach(setResult);
    }
  }

  const persistTestResult = submit ? 'submitTestResult' : 'saveTestResult';
  await mutate(
    gql`
      mutation PersistTestResult($input: TestResultInput!) {
        testResult(id: "${testResult.id}") {
          ${persistTestResult}(input: $input) {
            locationOfData
          }
        }
      }
    `,
    { variables: { input: testResult }, transaction }
  );
};

module.exports = { populateFakeTestResults, FAKE_RESULT_CONFLICTS_OPTIONS };
