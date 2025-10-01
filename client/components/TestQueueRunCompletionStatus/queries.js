import { gql } from '@apollo/client';

export const TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY = gql`
  query TestPlanRunAssertionResultsByTestPlanRunId($testPlanRunId: ID!) {
    testPlanRun(id: $testPlanRunId) {
      id
      isRerun
      testResults {
        id
        completedAt
        scenarioResults {
          output
          negativeSideEffects {
            id
          }
          assertionResults {
            passed
            failedReason
          }
        }
      }
      testPlanReport {
        id
        totalPossibleAssertions
      }
    }
  }
`;
