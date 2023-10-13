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
            id
            directory
            title
        }
        testPlanVersions(phases: [RD, DRAFT, CANDIDATE, RECOMMENDED]) {
            id
            title
            phase
            gitSha
            gitMessage
            updatedAt
            versionString
            draftPhaseReachedAt
            candidatePhaseReachedAt
            recommendedPhaseTargetDate
            recommendedPhaseReachedAt
            testPlan {
                directory
            }
            testPlanReports {
                id
                metrics
                markedFinalAt
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
                draftTestPlanRuns {
                    tester {
                        username
                    }
                    testPlanReport {
                        id
                    }
                    testResults {
                        test {
                            id
                        }
                        atVersion {
                            id
                            name
                        }
                        browserVersion {
                            id
                            name
                        }
                        completedAt
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
                    updatedAt
                    draftPhaseReachedAt
                    candidatePhaseReachedAt
                    recommendedPhaseTargetDate
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

export const UPDATE_TEST_PLAN_VERSION_RECOMMENDED_TARGET_DATE = gql`
    mutation UpdateTestPlanReportRecommendedTargetDate(
        $testPlanVersionId: ID!
        $recommendedPhaseTargetDate: Timestamp!
    ) {
        testPlanVersion(id: $testPlanVersionId) {
            updateRecommendedPhaseTargetDate(
                recommendedPhaseTargetDate: $recommendedPhaseTargetDate
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
                    recommendedPhaseTargetDate
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
