import { gql } from '@apollo/client';

export const CANDIDATE_TESTS_PAGE_QUERY = gql`
    query {
        testPlanReports(statuses: [FINALIZED]) {
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
            }
            vendorReviewStatus
            candidateStatusReachedAt
            recommendedStatusTargetDate
            issues {
                feedbackType
                isOpen
            }
        }
    }
`;
