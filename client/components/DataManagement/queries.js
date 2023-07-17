import { gql } from '@apollo/client';

export const DATA_MANAGEMENT_PAGE_QUERY = gql`
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
        testPlans {
            directory
            id
            title
            latestTestPlanVersion {
                id
                title
            }
        }
        testPlanVersions {
            id
            title
            phase
            gitSha
            gitMessage
            testPlan {
                directory
            }
            updatedAt
            draftPhaseReachedAt
            candidatePhaseReachedAt
            recommendedPhaseReachedAt
        }
        testPlanReports {
            id
            status
            at {
                id
                name
            }
            latestAtVersionReleasedAt {
                id
                name
                releasedAt
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
            issues {
                link
                isOpen
                feedbackType
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

export const UPDATE_TEST_PLAN_VERSION_PHASE = gql`
    mutation UpdateTestPlanVersionPhase(
        $testPlanVersionId: ID!
        $phase: TestPlanVersionPhase!
        $testPlanVersionDataToIncludeId: ID
    ) {
        testPlanVersion(id: $testPlanVersionId) {
            updatePhase(
                phase: $phase
                testPlanVersionDataToIncludeId: $testPlanVersionDataToIncludeId
            ) {
                testPlanVersion {
                    id
                    title
                    phase
                    gitSha
                    gitMessage
                    testPlan {
                        directory
                    }
                    updatedAt
                    draftPhaseReachedAt
                    candidatePhaseReachedAt
                    recommendedPhaseReachedAt
                }
            }
        }
    }
`;
