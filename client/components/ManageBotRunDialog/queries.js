import { gql } from '@apollo/client';

export const COLLECTION_JOB_ID_BY_TEST_PLAN_RUN_ID_QUERY = gql`
  query CollectionJobIdByTestPlanRunId($testPlanRunId: ID!) {
    collectionJobByTestPlanRunId(testPlanRunId: $testPlanRunId) {
      id
      status
      externalLogsUrl
    }
  }
`;

export const TEST_PLAN_REPORT_ASSIGNED_TESTERS_QUERY = gql`
  query TestPlanReportAssignedTesters($testPlanReportId: ID!) {
    testPlanReport(id: $testPlanReportId) {
      id
      draftTestPlanRuns {
        id
        tester {
          id
          username
          isBot
        }
      }
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

export const RETRY_CANCELED_COLLECTIONS = gql`
  mutation RetryCanceledCollections($collectionJobId: ID!) {
    collectionJob(id: $collectionJobId) {
      retryCanceledCollections {
        id
        status
        testStatus {
          status
        }
      }
    }
  }
`;
