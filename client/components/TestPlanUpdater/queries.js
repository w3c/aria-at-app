import { gql } from '@apollo/client';

export const TEST_PLAN_ID_QUERY = gql`
    query TestPlanIdQuery($testPlanReportId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            id
            at {
                name
                id
            }
            browser {
                id
                name
            }
            testPlanVersion {
                id
                testPlan {
                    id
                    latestTestPlanVersion {
                        id
                        gitSha
                        gitMessage
                        updatedAt
                    }
                }
                title
                gitMessage
                gitSha
                updatedAt
            }
        }
    }
`;

export const VERSION_QUERY = gql`
    fragment TestFragment on Test {
        __typename
        id
        title
        ats {
            id
        }
        atMode
        scenarios(atId: $atId) {
            commands {
                text
            }
        }
        assertions {
            priority
            text
        }
    }

    query LatestVersionQuery(
        $testPlanReportId: ID!
        $testPlanVersionId: ID!
        $atId: ID!
    ) {
        testPlanReport(id: $testPlanReportId) {
            id
            draftTestPlanRuns {
                tester {
                    id
                    username
                }
                testResults {
                    test {
                        ...TestFragment
                    }
                    atVersion {
                        id
                    }
                    browserVersion {
                        id
                    }
                    completedAt
                    scenarioResults {
                        output
                        assertionResults {
                            passed
                            failedReason
                        }
                        unexpectedBehaviors {
                            id
                            otherUnexpectedBehaviorText
                        }
                    }
                }
            }
        }
        testPlanVersion(id: $testPlanVersionId) {
            id
            tests {
                ...TestFragment
            }
        }
    }
`;

export const CREATE_TEST_PLAN_REPORT_MUTATION = gql`
    mutation CreateTestPlanReportMutation($input: TestPlanReportInput!) {
        findOrCreateTestPlanReport(input: $input) {
            populatedData {
                testPlanReport {
                    id
                }
            }
            created {
                locationOfData
                testPlanReport {
                    id
                }
            }
        }
    }
`;

export const CREATE_TEST_PLAN_RUN_MUTATION = gql`
    mutation CreateTestPlanRunMutation(
        $testPlanReportId: ID!
        $testerUserId: ID!
    ) {
        testPlanReport(id: $testPlanReportId) {
            assignTester(userId: $testerUserId) {
                testPlanRun {
                    id
                }
            }
        }
    }
`;

export const CREATE_TEST_RESULT_MUTATION = gql`
    mutation CreateTestResultMutation(
        $testPlanRunId: ID!
        $testId: ID!
        $atVersionId: ID!
        $browserVersionId: ID!
    ) {
        testPlanRun(id: $testPlanRunId) {
            findOrCreateTestResult(
                testId: $testId
                atVersionId: $atVersionId
                browserVersionId: $browserVersionId
            ) {
                testResult {
                    id
                    atVersion {
                        id
                    }
                    browserVersion {
                        id
                    }
                    scenarioResults {
                        id
                        assertionResults {
                            id
                        }
                        unexpectedBehaviors {
                            id
                        }
                    }
                }
            }
        }
    }
`;

export const SAVE_TEST_RESULT_MUTATION = gql`
    mutation SaveTestResultMutation(
        $testResultId: ID!
        $testResultInput: TestResultInput!
    ) {
        testResult(id: $testResultId) {
            saveTestResult(input: $testResultInput) {
                locationOfData
            }
        }
    }
`;

export const SUBMIT_TEST_RESULT_MUTATION = gql`
    mutation SubmitTestResultMutation(
        $testResultId: ID!
        $testResultInput: TestResultInput!
    ) {
        testResult(id: $testResultId) {
            submitTestResult(input: $testResultInput) {
                locationOfData
            }
        }
    }
`;

export const DELETE_TEST_PLAN_REPORT = gql`
    mutation DeleteTestPlanReport($testPlanReportId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            deleteTestPlanReport
        }
    }
`;
