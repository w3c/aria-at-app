import { gql } from '@apollo/client';

export const TEST_PLAN_RUNS_TEST_RESULTS_QUERY = gql`
  query TestPlanRunsTestResults($testPlanReportId: ID!) {
    testPlanRuns(testPlanReportId: $testPlanReportId) {
      id
      tester {
        username
      }
      testResults {
        id
        scenarioResults {
          assertionResults {
            passed
            failedReason
          }
        }
      }
      collectionJob {
        status
        testStatus {
          status
        }
      }
    }
  }
`;
