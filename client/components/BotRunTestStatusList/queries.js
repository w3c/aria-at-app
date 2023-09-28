import { gql } from '@apollo/client';

export const TEST_PLAN_RUNS_TEST_RESULTS_QUERY = gql`
    query TestPlanRunsTestResults($testPlanReportId: ID!) {
        testPlanRuns(testPlanReportId: $testPlanReportId) {
            id
            testResults {
                id
                scenarioResults {
                    assertionResults {
                        passed
                        failedReason
                    }
                }
            }
        }
    }
`;

export const COLLECTION_JOB_STATUS_BY_TEST_PLAN_RUN_ID_QUERY = gql`
    query CollectionJobStatusByTestPlanRunId($testPlanRunId: ID!) {
        collectionJobByTestPlanRunId(testPlanRunId: $testPlanRunId) {
            id
            status
        }
    }
`;
