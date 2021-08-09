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
                    status
                    details {
                        name
                        task
                        summary {
                            required {
                                pass
                                fail
                            }
                            optional {
                                pass
                                fail
                            }
                            unexpectedCount
                        }
                        commands {
                            output
                            command
                            support
                            assertions {
                                pass
                                fail
                                priority
                                assertion
                            }
                            unexpected_behaviors
                        }
                        specific_user_instruction
                    }
                }
                serializedForm {
                    name
                    value
                    checked
                    disabled
                    indeterminate
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
                    gitSha
                }
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
        $result: TestResultDataInput
        $serializedForm: [TestResultSerializedFormInput]
        $issues: [Int]
    ) {
        testPlanRun(id: $testPlanRunId) {
            updateTestResult(
                input: {
                    index: $index
                    result: $result
                    serializedForm: $serializedForm
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
                            status
                            details {
                                name
                                task
                                summary {
                                    required {
                                        pass
                                        fail
                                    }
                                    optional {
                                        pass
                                        fail
                                    }
                                    unexpectedCount
                                }
                                commands {
                                    output
                                    command
                                    support
                                    assertions {
                                        pass
                                        fail
                                        priority
                                        assertion
                                    }
                                    unexpected_behaviors
                                }
                                specific_user_instruction
                            }
                        }
                        serializedForm {
                            name
                            value
                            checked
                            disabled
                            indeterminate
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
                            gitSha
                        }
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
                            status
                            details {
                                name
                                task
                                summary {
                                    required {
                                        pass
                                        fail
                                    }
                                    optional {
                                        pass
                                        fail
                                    }
                                    unexpectedCount
                                }
                                commands {
                                    output
                                    command
                                    support
                                    assertions {
                                        pass
                                        fail
                                        priority
                                        assertion
                                    }
                                    unexpected_behaviors
                                }
                                specific_user_instruction
                            }
                        }
                        serializedForm {
                            name
                            value
                            checked
                            disabled
                            indeterminate
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
                            gitSha
                        }
                    }
                }
            }
        }
    }
`;
