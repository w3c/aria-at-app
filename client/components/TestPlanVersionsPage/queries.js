import { gql } from '@apollo/client';

export const TEST_PLAN_VERSIONS_PAGE_QUERY = gql`
    query TestPlanVersionsPageQuery($testPlanDirectory: ID!) {
        ats {
            id
            name
        }
        testPlan(id: $testPlanDirectory) {
            title
            issues {
                author
                title
                link
                feedbackType
                isOpen
                createdAt
                closedAt
                at {
                    name
                }
            }
            testPlanVersions {
                id
                testPlan {
                    directory
                }
                phase
                versionString
                deprecatedAt
                gitSha
                gitMessage
                draftPhaseReachedAt
                candidatePhaseReachedAt
                recommendedPhaseReachedAt
                testPlanReports {
                    id
                    isFinal
                    at {
                        name
                    }
                }
            }
        }
    }
`;
