import { gql } from '@apollo/client';

export const TEST_REVIEW_PAGE_QUERY = gql`
    query TestReviewPageQuery($testPlanVersionId: ID!) {
        testPlanVersion(id: $testPlanVersionId) {
            id
            title
            versionString
            gitSha
            gitMessage
            testPageUrl
            phase
            updatedAt
            draftPhaseReachedAt
            candidatePhaseReachedAt
            recommendedPhaseReachedAt
            deprecatedAt
            testPlan {
                directory
            }
            tests {
                id
                rowNumber
                title
                atMode
                ats {
                    id
                    name
                }
                renderedUrls {
                    at {
                        id
                    }
                    renderedUrl
                }
                renderableContents {
                    at {
                        id
                    }
                    renderableContent
                }
            }
            metadata
        }
    }
`;
