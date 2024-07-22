const { gql } = require('apollo-server-core');
const { getAtVersionByQuery } = require('../../models/services/AtService');
const {
  getBrowserVersionByQuery
} = require('../../models/services/BrowserService');
const { query, mutate } = require('../../tests/util/graphql-test-utilities');

const populateFakeTestResults = async (
  testPlanRunId,
  fakeTestResultTypes,
  { transaction }
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
          transaction
        });
        break;
      case 'completeAndFailingDueToIncorrectAssertions':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToIncorrectAssertions',
          submit: true,
          transaction
        });
        break;
      case 'completeAndFailingDueToNoOutputAssertions':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToNoOutputAssertions',
          submit: true,
          transaction
        });
        break;
      case 'completeAndFailingDueToUnexpectedBehaviors':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToUnexpectedBehaviors',
          submit: true,
          transaction
        });
        break;
      case 'completeAndFailingDueToMultiple':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToMultiple',
          submit: true,
          transaction
        });
        break;
      case 'incompleteAndEmpty':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'empty',
          submit: false,
          transaction
        });
        break;
      case 'incompleteAndPassing':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'passing',
          submit: false,
          transaction
        });
        break;
      case 'incompleteAndFailingDueToIncorrectAssertions':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToIncorrectAssertions',
          submit: false,
          transaction
        });
        break;
      case 'incompleteAndFailingDueToNoOutputAssertions':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToNoOutputAssertions',
          submit: false,
          transaction
        });
        break;
      case 'incompleteAndFailingDueToUnexpectedBehaviors':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToUnexpectedBehaviors',
          submit: false,
          transaction
        });
        break;
      case 'incompleteAndFailingDueToMultiple':
        await getFake({
          testPlanReport,
          testPlanRunId,
          index,
          fakeTestResultType: 'failingDueToMultiple',
          submit: false,
          transaction
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
  transaction
}) => {
  const testId = testPlanReport.runnableTests[index].id;

  const atVersion = await getAtVersionByQuery({
    where: { atId: testPlanReport.at.id },
    pagination: { order: [['releasedAt', 'DESC']] },
    transaction
  });

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
                        atVersionId: "${atVersion.id}",
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
    atVersionId: atVersion.id,
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

  switch (fakeTestResultType) {
    case 'empty':
      return;
    case 'passing':
      break;
    case 'failingDueToIncorrectAssertions':
      testResult.scenarioResults[0].assertionResults[0].passed = false;
      testResult.scenarioResults[0].assertionResults[0].failedReason =
        'INCORRECT_OUTPUT';
      break;
    case 'failingDueToNoOutputAssertions':
      testResult.scenarioResults[0].assertionResults[0].passed = false;
      testResult.scenarioResults[0].assertionResults[0].failedReason =
        'NO_OUTPUT';
      break;
    case 'failingDueToUnexpectedBehaviors':
      testResult.scenarioResults[0].unexpectedBehaviors.push({
        id: 'OTHER',
        impact: 'MODERATE',
        details: 'Seeded other unexpected behavior'
      });
      break;
    case 'failingDueToMultiple':
      testResult.scenarioResults[0].assertionResults[0].passed = false;
      testResult.scenarioResults[0].assertionResults[0].failedReason =
        'INCORRECT_OUTPUT';
      testResult.scenarioResults[0].unexpectedBehaviors.push({
        id: 'EXCESSIVELY_VERBOSE',
        impact: 'MODERATE',
        details: 'N/A'
      });
      testResult.scenarioResults[0].unexpectedBehaviors.push({
        id: 'OTHER',
        impact: 'SEVERE',
        details: 'Seeded other unexpected behavior'
      });
      break;
    default:
      throw new Error();
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

module.exports = populateFakeTestResults;
