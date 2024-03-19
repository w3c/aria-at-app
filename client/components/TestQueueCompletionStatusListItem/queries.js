import { gql } from '@apollo/client';

export const TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY = gql`
  query TestPlanRunAssertionResultsByTestPlanRunId($testPlanRunId: ID!) {
    testPlanRun(id: $testPlanRunId) {
      id
      testResults {
        id
        completedAt
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
