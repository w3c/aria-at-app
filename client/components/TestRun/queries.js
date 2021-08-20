import { gql } from '@apollo/client';

export const TEST_RUN_PAGE_QUERY = gql`
    query TestPlanRunPage($testPlanRunId: ID!) {
        testPlanRun(id: $testPlanRunId) {
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
        users {
            id
            username
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
