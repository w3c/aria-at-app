import { gql } from '@apollo/client';

export const CANDIDATE_TESTS_PAGE_QUERY = gql`
    query {
        testPlanReports(statuses: [CANDIDATE]) {
            id
            metrics
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
                testPlan {
                    directory
                }
                metadata
                updatedAt
            }
            vendorReviewStatus
            candidateStatusReachedAt
            recommendedStatusTargetDate
            issues {
                link
                isOpen
                feedbackType
            }
        }
    }
`;
