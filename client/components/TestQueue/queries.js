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
        }
        ats {
            id
            name
            atVersions {
                id
                name
                releasedAt
            }
        }
        browsers {
            id
            name
        }
        testPlanVersions {
            id
            title
            gitSha
            gitMessage
            testPlan {
                directory
            }
            updatedAt
        }
        testPlanReports(statuses: [DRAFT, IN_REVIEW]) {
            id
            status
            conflictsLength
            runnableTestsLength
            at {
                id
                name
            }
            browser {
                id
                name
            }
            testPlanVersion {
                id
                title
                gitSha
                gitMessage
                testPlan {
                    directory
                }
                updatedAt
            }
            draftTestPlanRuns {
                id
                tester {
                    id
                    username
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
            status
            conflictsLength
            runnableTests {
                id
            }
            runnableTestsLength
            at {
                id
                name
            }
            browser {
                id
                name
            }
            testPlanVersion {
                id
                title
                gitSha
                gitMessage
                testPlan {
                    directory
                }
                updatedAt
            }
            draftTestPlanRuns {
                id
                tester {
                    id
                    username
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

export const TEST_PLAN_REPORT_CANDIDATE_RECOMMENDED_QUERY = gql`
    query CandidateTestPlanReportsQuery {
        testPlanReports(statuses: [CANDIDATE, RECOMMENDED]) {
            id
            status
            latestAtVersionReleasedAt {
                id
                name
                releasedAt
            }
            candidateStatusReachedAt
            recommendedStatusTargetDate
            at {
                id
                name
            }
            browser {
                id
                name
            }
            testPlanVersion {
                id
                title
                gitSha
                testPlan {
                    directory
                }
                metadata
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
    ) {
        findOrCreateTestPlanReport(
            input: {
                testPlanVersionId: $testPlanVersionId
                atId: $atId
                browserId: $browserId
            }
        ) {
            populatedData {
                testPlanReport {
                    id
                    status
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
    mutation AssignTester($testReportId: ID!, $testerId: ID!) {
        testPlanReport(id: $testReportId) {
            assignTester(userId: $testerId) {
                testPlanReport {
                    draftTestPlanRuns {
                        tester {
                            id
                            username
                        }
                    }
                }
            }
        }
    }
`;

export const UPDATE_TEST_PLAN_REPORT_STATUS_MUTATION = gql`
    mutation UpdateTestPlanReportStatus(
        $testReportId: ID!
        $status: TestPlanReportStatus!
        $candidateStatusReachedAt: Timestamp
        $recommendedStatusTargetDate: Timestamp
    ) {
        testPlanReport(id: $testReportId) {
            updateStatus(
                status: $status
                candidateStatusReachedAt: $candidateStatusReachedAt
                recommendedStatusTargetDate: $recommendedStatusTargetDate
            ) {
                testPlanReport {
                    status
                }
            }
        }
    }
`;

export const UPDATE_TEST_PLAN_REPORT_RECOMMENDED_TARGET_DATE_MUTATION = gql`
    mutation UpdateTestPlanReportRecommendedTargetDate(
        $testReportId: ID!
        $recommendedStatusTargetDate: Timestamp!
    ) {
        testPlanReport(id: $testReportId) {
            updateRecommendedStatusTargetDate(
                recommendedStatusTargetDate: $recommendedStatusTargetDate
            ) {
                testPlanReport {
                    recommendedStatusTargetDate
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
