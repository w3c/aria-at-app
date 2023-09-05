import { gql } from '@apollo/client';

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
