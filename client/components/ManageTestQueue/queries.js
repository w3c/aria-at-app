import { gql } from '@apollo/client';

export const CREATE_MANAGE_TEST_QUEUE_MUTATION = gql`
    mutation CreateRequiredReport(
        $atId: ID!
        $browserId: ID!
        $phase: RequiredReportPhase!
    ) {
        requiredReport(atId: $atId, browserId: $browserId, phase: $phase) {
            createRequiredReport {
                atId
                browserId
                phase
            }
        }
    }
`;

export const UPDATE_MANAGE_TEST_QUEUE_MUTATION = gql`
    mutation UpdateRequiredReport(
        $atId: ID!
        $browserId: ID!
        $phase: RequiredReportPhase!
    ) {
        requiredReport(atId: $atId, browserId: $browserId, phase: $phase) {
            updateRequiredReport {
                atId
                browserId
                phase
            }
        }
    }
`;

// DELET_MANAGE_TEST_QUEUE_MUTATION

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
