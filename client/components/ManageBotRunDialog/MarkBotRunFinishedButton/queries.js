const { gql } = require('@apollo/client');

export const TEST_PLAN_RUN_TEST_RESULTS_COMPLETION_STATUS = gql`
    query TestPlanRunTestResultsCompletionStatus($testPlanRunId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            id
            testResults {
                id
                completedAt
            }
        }
    }
`;

export const SUBMIT_TEST_RESULT_MUTATION = gql`
    mutation SubmitTestResult($id: ID!) {
        testResult(id: $id) {
            submitTestResult(input: { id: $id }) {
                testPlanRun {
                    id
                    testResults {
                        id
                        completedAt
                    }
                }
            }
        }
    }
`;
