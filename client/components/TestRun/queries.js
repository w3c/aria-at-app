import { gql } from '@apollo/client';

export const TEST_RUN_PAGE_QUERY = gql`
    query TestPlanRunPage($testPlanRunId: ID!) {
        testPlanRun(id: $testPlanRunId) {
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
                assertions(priority: REQUIRED) {
                    command
                    priority
                    manualAssertion
                }
                assertionsCount(priority: REQUIRED)
                assertionsPassed(priority: REQUIRED)
                unexpectedBehaviorCount
                result {
                    test
                }
                serializedForm {
                    name
                }
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
                }
            }
        }
        users {
            id
            username
        }
    }
`;

export const CLEAR_TEST_RESULT_MUTATION = gql`
    mutation ClearTestResult($testPlanRunId: ID!, $index: Int!) {
        testPlanRun(id: $testPlanRunId) {
            clearTestResult(input: { index: $index }) {
                testPlanRun {
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
                        assertions(priority: REQUIRED) {
                            command
                            priority
                            manualAssertion
                        }
                        assertionsCount(priority: REQUIRED)
                        assertionsPassed(priority: REQUIRED)
                        unexpectedBehaviorCount
                        result {
                            test
                        }
                        serializedForm {
                            name
                        }
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
                        }
                    }
                }
            }
        }
    }
`;
