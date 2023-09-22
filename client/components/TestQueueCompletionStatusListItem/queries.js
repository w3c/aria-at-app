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

export const ALL_ASSERTIONS_FOR_TEST_PLAN_VERSION_QUERY = gql`
    query AllAssertionsForTestPlanVersionQuery($testPlanVersionId: ID!) {
        testPlanVersion(id: $testPlanVersionId) {
            id
            tests {
                assertions {
                    id
                }
            }
        }
    }
`;
