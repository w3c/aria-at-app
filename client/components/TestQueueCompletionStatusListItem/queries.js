import { gql } from '@apollo/client';

export const TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY = gql`
    query TestPlanRunAssertionResultsByTestPlanRunId($testPlanRunId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            id
            testResults {
                scenarioResults {
                    assertionResults {
                        passed
                    }
                }
            }
        }
    }
`;

export const TEST_RESULTS_QUERY = gql`
    query TestResultsQuery($testPlanRunId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            testResults {
                id
            }
        }
    }
`;
