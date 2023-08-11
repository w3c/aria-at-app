import { gql } from '@apollo/client';

export const DATA_MANAGEMENT_PAGE_QUERY = gql`
    query DataManagementPage {
        me {
            id
            username
            roles
        }
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
        }
        testPlanVersions {
            id
            title
            phase
            gitSha
            gitMessage
            updatedAt
            draftPhaseReachedAt
            candidatePhaseReachedAt
            recommendedPhaseReachedAt
            testPlan {
                directory
            }
            testPlanReports {
                id
                at {
                    id
                    name
                }
                browser {
                    id
                    name
                }
                issues {
                    link
                    isOpen
                    feedbackType
                }
            }
        }
<<<<<<< HEAD
        testPlanReports {
            id
            at {
                id
                name
            }
            testPlanVersion {
                id
                testPlan {
                    directory
                }
            }
        }
=======
>>>>>>> 69063e7fbfc9b295a75b8704121b9354b84d9c4b
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
                    updatedAt
                    draftPhaseReachedAt
                    candidatePhaseReachedAt
                    recommendedPhaseReachedAt
                    testPlan {
                        directory
                    }
                    testPlanReports {
                        id
                        at {
                            id
                            name
                        }
                        browser {
                            id
                            name
                        }
                        issues {
                            link
                            isOpen
                            feedbackType
                        }
                    }
                }
            }
        }
    }
`;
