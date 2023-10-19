import { gql } from '@apollo/client';

export const COLLECTION_JOB_ID_BY_TEST_PLAN_RUN_ID_QUERY = gql`
    query CollectionJobIdByTestPlanRunId($testPlanRunId: ID!) {
        collectionJobByTestPlanRunId(testPlanRunId: $testPlanRunId) {
            id
            status
        }
    }
`;

export const CANCEL_COLLECTION_JOB = gql`
    mutation CancelCollectionJob($collectionJobId: ID!) {
        collectionJob(id: $collectionJobId) {
            cancelCollectionJob {
                id
                status
            }
        }
    }
`;

export const DELETE_TEST_PLAN_RUN = gql`
    mutation DeleteTestPlanRun($testPlanReportId: ID!, $userId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            deleteTestPlanRun(userId: $userId) {
                testPlanRun {
                    id
                }
            }
        }
    }
`;

export const RETRY_CANCELLED_COLLECTIONS = gql`
    mutation RetryCancelledCollections($collectionJobId: ID!) {
        collectionJob(id: $collectionJobId) {
            retryCancelledCollections {
                id
                status
            }
        }
    }
`;
