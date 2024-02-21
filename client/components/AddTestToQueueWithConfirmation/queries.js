import { gql } from '@apollo/client';

export const SCHEDULE_COLLECTION_JOB_MUTATION = gql`
    mutation ScheduleCollectionJob($testPlanReportId: ID!) {
        scheduleCollectionJob(testPlanReportId: $testPlanReportId) {
            id
            status
        }
    }
`;

export const EXISTING_TEST_PLAN_REPORTS = gql`
    query ExistingTestPlanReports($testPlanVersionId: ID!) {
        testPlanVersion(id: $testPlanVersionId) {
            id
            testPlanReports {
                id
                markedFinalAt
                isFinal
                draftTestPlanRuns {
                    initiatedByAutomation
                }
                at {
                    id
                }
                browser {
                    id
                }
            }
        }
    }
`;
