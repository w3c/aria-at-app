import { gql } from '@apollo/client';

export const TEST_QUEUE_PAGE_QUERY = gql`
    query TestQueuePage {
        me {
            id
            username
            roles
        }
        users {
            id
            username
            roles
            isBot
            ats {
                id
                key
            }
        }
        ats {
            id
            name
            key
            atVersions {
                id
                name
                releasedAt
            }
            browsers {
                id
                name
            }
            candidateBrowsers {
                id
                name
            }
            recommendedBrowsers {
                id
                name
            }
        }
        testPlanVersions {
            id
            title
            phase
            gitSha
            gitMessage
            testPlan {
                directory
            }
            updatedAt
        }
        testPlanReports(
            isFinal: false
            testPlanVersionPhases: [DRAFT, CANDIDATE, RECOMMENDED]
        ) {
            id
            conflictsLength
            runnableTestsLength
            markedFinalAt
            at {
                id
                key
                name
            }
            browser {
                id
                key
                name
            }
            testPlanVersion {
                id
                title
                phase
                gitSha
                gitMessage
                testPlan {
                    directory
                }
                versionString
            }
            draftTestPlanRuns {
                id
                initiatedByAutomation
                tester {
                    id
                    username
                    isBot
                }
                testResultsLength
            }
        }
        testPlans {
            latestTestPlanVersion {
                id
                gitSha
                testPlan {
                    id
                }
            }
        }
    }
`;

export const TEST_PLAN_REPORT_QUERY = gql`
    query TestPlanReport($testPlanReportId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            id
            conflictsLength
            runnableTests {
                id
            }
            runnableTestsLength
            at {
                id
                key
                name
            }
            browser {
                id
                key
                name
            }
            testPlanVersion {
                id
                title
                phase
                gitSha
                gitMessage
                testPlan {
                    directory
                }
                versionString
                updatedAt
            }
            draftTestPlanRuns {
                id
                initiatedByAutomation
                tester {
                    id
                    username
                    isBot
                }
                testResults {
                    id
                    test {
                        id
                    }
                    completedAt
                }
                testResultsLength
            }
        }
    }
`;

export const TEST_PLAN_REPORT_AT_BROWSER_QUERY = gql`
    query TestPlanReportAtBrowser($testPlanReportId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            id
            at {
                id
                key
                name
            }
            browser {
                id
                key
                name
            }
        }
    }
`;

export const ADD_AT_VERSION_MUTATION = gql`
    mutation AddAtVersion($atId: ID!, $name: String!, $releasedAt: Timestamp!) {
        at(id: $atId) {
            findOrCreateAtVersion(
                input: { name: $name, releasedAt: $releasedAt }
            ) {
                id
                name
                releasedAt
            }
        }
    }
`;

export const EDIT_AT_VERSION_MUTATION = gql`
    mutation EditAtVersion(
        $atVersionId: ID!
        $name: String!
        $releasedAt: Timestamp!
    ) {
        atVersion(id: $atVersionId) {
            updateAtVersion(input: { name: $name, releasedAt: $releasedAt }) {
                id
                name
                releasedAt
            }
        }
    }
`;

export const DELETE_AT_VERSION_MUTATION = gql`
    mutation DeleteAtVersion($atVersionId: ID!) {
        atVersion(id: $atVersionId) {
            deleteAtVersion {
                isDeleted
                failedDueToTestResults {
                    testPlanVersion {
                        id
                        title
                    }
                    # To be used when listing the conflicting results
                    testResult {
                        id
                    }
                    # To be used when providing more details on the conflicting results
                    testPlanReport {
                        at {
                            name
                        }
                        browser {
                            name
                        }
                    }
                }
            }
        }
    }
`;

export const ADD_TEST_QUEUE_MUTATION = gql`
    mutation AddTestPlanReport(
        $testPlanVersionId: ID!
        $atId: ID!
        $browserId: ID!
        $copyResultsFromTestPlanReportId: ID
    ) {
        findOrCreateTestPlanReport(
            input: {
                testPlanVersionId: $testPlanVersionId
                atId: $atId
                browserId: $browserId
                copyResultsFromTestPlanReportId: $copyResultsFromTestPlanReportId
            }
        ) {
            populatedData {
                testPlanReport {
                    id
                    at {
                        id
                    }
                    browser {
                        id
                    }
                }
                testPlanVersion {
                    id
                }
            }
            created {
                locationOfData
            }
        }
    }
`;

export const ASSIGN_TESTER_MUTATION = gql`
    mutation AssignTester(
        $testReportId: ID!
        $testerId: ID!
        $testPlanRunId: ID
    ) {
        testPlanReport(id: $testReportId) {
            assignTester(userId: $testerId, testPlanRunId: $testPlanRunId) {
                testPlanReport {
                    draftTestPlanRuns {
                        initiatedByAutomation
                        tester {
                            id
                            username
                            isBot
                        }
                    }
                }
            }
        }
    }
`;

export const UPDATE_TEST_PLAN_REPORT_APPROVED_AT_MUTATION = gql`
    mutation UpdateTestPlanReportMarkedFinalAt($testReportId: ID!) {
        testPlanReport(id: $testReportId) {
            markAsFinal {
                testPlanReport {
                    markedFinalAt
                }
            }
        }
    }
`;

export const REMOVE_TEST_PLAN_REPORT_MUTATION = gql`
    mutation RemoveTestPlanReport($testReportId: ID!) {
        testPlanReport(id: $testReportId) {
            deleteTestPlanReport
        }
    }
`;

export const REMOVE_TESTER_MUTATION = gql`
    mutation RemoveTester($testReportId: ID!, $testerId: ID!) {
        testPlanReport(id: $testReportId) {
            deleteTestPlanRun(userId: $testerId) {
                testPlanReport {
                    draftTestPlanRuns {
                        tester {
                            id
                            username
                            isBot
                        }
                    }
                }
            }
        }
    }
`;

export const REMOVE_TESTER_RESULTS_MUTATION = gql`
    mutation RemoveTesterResult($testPlanRunId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            deleteTestResults {
                locationOfData
            }
        }
    }
`;
