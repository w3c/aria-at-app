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
                conflictsFormatted(markdown: true)
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

export const FIND_OR_CREATE_TEST_RESULT_MUTATION = gql`
    mutation FindOrCreateTestResult($testPlanRunId: ID!, $testId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            findOrCreateTestResult(testId: $testId) {
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

export const DELETE_TEST_RESULT_MUTATION = gql`
    mutation DeleteTestResult($id: ID!) {
        testResult(id: $id) {
            deleteTestResult {
                locationOfData
            }
        }
    }
`;
