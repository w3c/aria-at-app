import { gql } from '@apollo/client';

export const TEST_RUN_PAGE_QUERY = gql`
    query TestPlanRunPage($testPlanRunId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            id
            tester {
                id
                username
            }
            testResults {
                id
                test {
                    id
                    title
                    ats {
                        id
                        name
                    }
                    atMode
                    scenarios {
                        id
                        at {
                            id
                            name
                        }
                        command {
                            id
                            text
                        }
                    }
                    assertions {
                        id
                        priority
                        text
                    }
                    renderableContent
                }
                startedAt
                completedAt
                scenarioResults {
                    id
                    output
                    assertionResults {
                        id
                        passed
                        failedReason
                    }
                    unexpectedBehaviors {
                        id
                        text
                        otherUnexpectedBehaviorText
                    }
                }
            }
            testPlanReport {
                id
                status
                conflicts {
                    source {
                        locationOfData
                    }
                    conflictingResults {
                        locationOfData
                    }
                }
                testPlanTarget {
                    title
                    at {
                        id
                        name
                    }
                    atVersion
                    browser {
                        name
                    }
                    browserVersion
                }
                testPlanVersion {
                    id
                    title
                    gitSha
                    testPageUrl
                }
                runnableTests {
                    id
                    title
                    ats {
                        id
                        name
                    }
                    atMode
                    scenarios {
                        id
                        at {
                            id
                            name
                        }
                        command {
                            id
                            text
                        }
                    }
                    assertions {
                        id
                        priority
                        text
                    }
                    # renderableContent
                }
            }
            tester {
                id
                username
            }
        }
        users {
            id
            username
        }
    }
`;

export const CREATE_TEST_RESULT_MUTATION = gql`
    mutation CreateTestResult($testPlanRunId: ID!, $testId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            createTestResult(testId: $testId) {
                locationOfData
            }
        }
    }
`;

export const SAVE_TEST_RESULT_MUTATION = gql`
    mutation SaveTestResult(
        $id: ID!
        $scenarioResults: [ScenarioResultInput]!
    ) {
        testResult(id: $id) {
            saveTestResult(
                input: { id: $id, scenarioResults: $scenarioResults }
            ) {
                locationOfData
            }
        }
    }
`;

export const SUBMIT_TEST_RESULT_MUTATION = gql`
    mutation SubmitTestResult(
        $id: ID!
        $scenarioResults: [ScenarioResultInput]!
    ) {
        testResult(id: $id) {
            submitTestResult(
                input: { id: $id, scenarioResults: $scenarioResults }
            ) {
                locationOfData
            }
        }
    }
`;

export const UPDATE_TEST_RUN_RESULT_MUTATION = gql`
    mutation UpdateTestPlanRunResult(
        $testPlanRunId: ID!
        $index: Int!
        $result: Object
        $state: Object
        $issues: [Int]
    ) {
        testPlanRun(id: $testPlanRunId) {
            updateTestResult(
                input: {
                    index: $index
                    result: $result
                    state: $state
                    issues: $issues
                }
            ) {
                testPlanRun {
                    id
                    isComplete
                    testResultCount
                    tester {
                        id
                        username
                    }
                    testResults {
                        title
                        index
                        testFilePath
                        isComplete
                        isSkipped
                        commandJson
                        scripts
                        testJson
                        assertions(priority: REQUIRED) {
                            command
                            priority
                            manualAssertion
                        }
                        assertionsCount(priority: REQUIRED)
                        assertionsPassed(priority: REQUIRED)
                        unexpectedBehaviorCount
                        result
                        state
                        issues
                    }
                    testPlanReport {
                        id
                        status
                        conflictCount
                        conflicts
                        testPlanTarget {
                            title
                            at {
                                name
                            }
                            atVersion
                            browser {
                                name
                            }
                            browserVersion
                        }
                        testPlanVersion {
                            title
                            directory
                            testReferencePath
                            gitSha
                        }
                    }
                    tester {
                        id
                        username
                    }
                }
            }
        }
    }
`;

export const CLEAR_TEST_RESULT_MUTATION = gql`
    mutation ClearTestResult($testPlanRunId: ID!, $index: Int!) {
        testPlanRun(id: $testPlanRunId) {
            clearTestResult(input: { index: $index }) {
                testPlanRun {
                    id
                    isComplete
                    testResultCount
                    tester {
                        id
                        username
                    }
                    testResults {
                        title
                        index
                        testFilePath
                        isComplete
                        isSkipped
                        commandJson
                        scripts
                        testJson
                        assertions(priority: REQUIRED) {
                            command
                            priority
                            manualAssertion
                        }
                        assertionsCount(priority: REQUIRED)
                        assertionsPassed(priority: REQUIRED)
                        unexpectedBehaviorCount
                        result
                        state
                        issues
                    }
                    testPlanReport {
                        id
                        status
                        conflictCount
                        conflicts
                        testPlanTarget {
                            title
                            at {
                                name
                            }
                            atVersion
                            browser {
                                name
                            }
                            browserVersion
                        }
                        testPlanVersion {
                            title
                            directory
                            testReferencePath
                            gitSha
                        }
                    }
                    tester {
                        id
                        username
                    }
                }
            }
        }
    }
`;
