const { gql } = require('apollo-server-core');
const { query, mutate } = require('../../tests/util/graphql-test-utilities');

const populateFakeTestResults = async (testPlanRunId, fakeTestResultTypes) => {
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
                    testPlanRunId,
                    index,
                    fakeTestResultType: 'passing',
                    submit: true
                });
                break;
            case 'completeAndFailingDueToIncorrectAssertions':
                await getFake({
                    testPlanRunId,
                    index,
                    fakeTestResultType: 'failingDueToIncorrectAssertions',
                    submit: true
                });
                break;
            case 'completeAndFailingDueToNoOutputAssertions':
                await getFake({
                    testPlanRunId,
                    index,
                    fakeTestResultType: 'failingDueToNoOutputAssertions',
                    submit: true
                });
                break;
            case 'completeAndFailingDueToUnexpectedBehaviors':
                await getFake({
                    testPlanRunId,
                    index,
                    fakeTestResultType: 'failingDueToUnexpectedBehaviors',
                    submit: true
                });
                break;
            case 'incompleteAndEmpty':
                await getFake({
                    testPlanRunId,
                    index,
                    fakeTestResultType: 'empty',
                    submit: false
                });
                break;
            case 'incompleteAndPassing':
                await getFake({
                    testPlanRunId,
                    index,
                    fakeTestResultType: 'passing',
                    submit: false
                });
                break;
            case 'incompleteAndFailingDueToIncorrectAssertions':
                await getFake({
                    testPlanRunId,
                    index,
                    fakeTestResultType: 'failingDueToIncorrectAssertions',
                    submit: false
                });
                break;
            case 'incompleteAndFailingDueToNoOutputAssertions':
                await getFake({
                    testPlanRunId,
                    index,
                    fakeTestResultType: 'failingDueToNoOutputAssertions',
                    submit: false
                });
                break;
            case 'incompleteAndFailingDueToUnexpectedBehaviors':
                await getFake({
                    testPlanRunId,
                    index,
                    fakeTestResultType: 'failingDueToUnexpectedBehaviors',
                    submit: false
                });
                break;
            default:
                throw new Error(
                    `Invalid fake test result type '${fakeTestResultType}'`
                );
        }

        index += 1;
    }
};

const getFake = async ({
    testPlanRunId,
    index,
    fakeTestResultType,
    submit
}) => {
    if (fakeTestResultType === null) return;

    const {
        populateData: { testPlanReport }
    } = await query(gql`
        query {
            populateData(locationOfData: { testPlanRunId: ${testPlanRunId} }) {
                testPlanReport {
                    runnableTests {
                        id
                    }
                }
            }
        }
    `);

    const testId = testPlanReport.runnableTests[index].id;

    const {
        testPlanRun: {
            findOrCreateTestResult: { testResult: baseTestResult }
        }
    } = await mutate(gql`
        mutation {
            testPlanRun(id: ${testPlanRunId}) {
                findOrCreateTestResult(testId: "${testId}") {
                    testResult {
                        id
                        scenarioResults {
                            id
                            output
                            assertionResults {
                                id
                                passed
                                failedReason
                            }
                        }
                    }
                }
            }
        }
    `);

    const getPassing = () => ({
        ...baseTestResult,
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
                id: 'EXCESSIVELY_VERBOSE'
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
        { variables: { input: testResult } }
    );
};

module.exports = populateFakeTestResults;
