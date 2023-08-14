import { gql } from '@apollo/client';

export const CANDIDATE_REVIEW_PAGE_QUERY = gql`
    query {
        testPlanVersions(phases: [CANDIDATE]) {
            id
            phase
            title
            gitSha
            testPlan {
                directory
            }
            metadata
            updatedAt
            candidatePhaseReachedAt
            recommendedPhaseTargetDate
            testPlanReports(isCurrentPhase: true) {
                id
                status
                metrics
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
                    testPlan {
                        directory
                    }
                    metadata
                    updatedAt
                }
                vendorReviewStatus
                issues {
                    link
                    isOpen
                    feedbackType
                }
            }
        }
    }
`;

export const UPDATE_TEST_PLAN_VERSION_RECOMMENDED_TARGET_DATE_MUTATION = gql`
    mutation UpdateTestPlanReportRecommendedTargetDate(
        $testPlanVersionId: ID!
        $recommendedPhaseTargetDate: Timestamp!
    ) {
        testPlanVersion(id: $testPlanVersionId) {
            updateRecommendedPhaseTargetDate(
                recommendedPhaseTargetDate: $recommendedPhaseTargetDate
            ) {
                testPlanVersion {
                    phase
                    testPlanReports {
                        id
                        status
                    }
                }
            }
        }
    }
`;
