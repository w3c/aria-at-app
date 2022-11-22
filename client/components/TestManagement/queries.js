import { gql } from '@apollo/client';

export const TEST_MANAGEMENT_PAGE_QUERY = gql`
    query TestManagementPage {
        ats {
            id
            name
            atVersions {
                id
                name
                releasedAt
            }
        }
        browsers {
            id
            name
        }
        testPlanVersions {
            id
            title
            gitSha
            gitMessage
            testPlan {
                directory
            }
            updatedAt
        }
        testPlanReports(statuses: [DRAFT, IN_REVIEW, CANDIDATE, RECOMMENDED]) {
            id
            status
            at {
                id
                name
            }
            browser {
                id
                name
            }
            testPlanVersion {
                id
                title
                gitSha
                gitMessage
                testPlan {
                    directory
                }
                updatedAt
            }
        }
    }
`;

export const BULK_UPDATE_TEST_PLAN_REPORT_STATUS_MUTATION = gql`
    mutation BulkUpdateTestPlanReportStatus(
        $testReportIds: [ID]!
        $status: TestPlanReportStatus!
    ) {
        testPlanReport(ids: $testReportIds) {
            bulkUpdateStatus(status: $status) {
                testPlanReport {
                    id
                    status
                    at {
                        id
                        name
                    }
                    browser {
                        id
                        name
                    }
                    testPlanVersion {
                        id
                        title
                        gitSha
                        gitMessage
                        testPlan {
                            directory
                        }
                        updatedAt
                    }
                }
            }
        }
    }
`;
