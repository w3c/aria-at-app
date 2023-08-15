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
            testPlanReports(isFinal: true) {
                id
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
