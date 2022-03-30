import { gql } from '@apollo/client';

export const TEST_PLAN_ID_QUERY = gql`
    query TestPlanIdQuery($testPlanReportId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            id
            testPlanVersion {
                id
                testPlan {
                    id
                }
            }
        }
    }
`;

export const UPDATER_QUERY = gql`
    query Updater($testPlanReportId: ID!, $testPlanId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            id
            testPlanTarget {
                at {
                    name
                    id
                }
                atVersion
                browser {
                    id
                    name
                }
                browserVersion
            }
            testPlanVersion {
                id
                title
                gitMessage
                gitSha
                updatedAt
            }
        }
        testPlan(id: $testPlanId) {
            latestTestPlanVersion {
                id
                gitMessage
                gitSha
                updatedAt
            }
            testPlanVersions {
                id
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

    query VersionQuery(
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
    mutation CreateTestResultMutation($testPlanRunId: ID!, $testId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            findOrCreateTestResult(testId: $testId) {
                testResult {
                    id
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
