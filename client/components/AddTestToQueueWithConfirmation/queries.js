import { gql } from '@apollo/client';

export const SCHEDULE_COLLECTION_JOB_MUTATION = gql`
    mutation ScheduleCollectionJob($testPlanReportId: ID!) {
        scheduleCollectionJob(testPlanReportId: $testPlanReportId) {
            id
            status
        }
    }
`;
