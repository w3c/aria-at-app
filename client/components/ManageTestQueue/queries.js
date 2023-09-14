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
        $updateAtId: ID!
        $updateBrowserId: ID!
    ) {
        requiredReport(atId: $atId, browserId: $browserId, phase: $phase) {
            updateRequiredReport(
                atId: $updateAtId
                browserId: $updateBrowserId
            ) {
                atId
                browserId
                phase
            }
        }
    }
`;

export const DELETE_MANAGE_TEST_QUEUE_MUTATION = gql`
    mutation DeleteRequiredReport(
        $atId: ID!
        $browserId: ID!
        $phase: RequiredReportPhase!
    ) {
        requiredReport(atId: $atId, browserId: $browserId, phase: $phase) {
            deleteRequiredReport {
                atId
                browserId
                phase
            }
        }
    }
`;

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
