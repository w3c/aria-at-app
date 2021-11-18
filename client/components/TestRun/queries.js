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
                        test {
                            id
                        }
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
                    testPlan {
                        directory
                    }
                }
                runnableTests {
                    id
                    title
                    ats {
                        id
                        name
                    }
                    atMode
                    renderedUrl
                    scenarios {
                        id
                        at {
                            id
                            name
                        }
                        commands {
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
        }
        me {
            id
            username
            roles
        }
        users {
            id
            username
        }
    }
`;

export const TEST_RUN_PAGE_ANON_QUERY = gql`
    query TestPlanRunAnonPage($testPlanReportId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            id
            status
            conflicts {
                source {
                    test {
                        id
                    }
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
                testPlan {
                    directory
                }
            }
            runnableTests {
                id
                title
                ats {
                    id
                    name
                }
                atMode
                renderedUrl
                renderableContent
                scenarios {
                    id
                    at {
                        id
                        name
                    }
                    commands {
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
