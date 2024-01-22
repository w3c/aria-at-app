import { gql } from '@apollo/client';

export const SCHEDULE_COLLECTION_JOB_MUTATION = gql`
    mutation ScheduleCollectionJob($testPlanReportId: ID!) {
        scheduleCollectionJob(testPlanReportId: $testPlanReportId) {
            id
            status
        }
    }
`;

export const TEST_PLAN_RUN_REPORTS_INITIATED_BY_AUTOMATION = gql`
    query DraftTestPlanRunsTestPlanReports($testPlanVersionId: ID!) {
        testPlanVersion(id: $testPlanVersionId) {
            id
            testPlanReports {
                id
                markedFinalAt
                draftTestPlanRuns {
                    initiatedByAutomation
                }
            }
        }
    }
`;
