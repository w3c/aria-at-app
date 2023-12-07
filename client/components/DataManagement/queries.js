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
            browsers {
                id
                name
            }
            atVersions {
                id
                name
                releasedAt
            }
            candidateBrowsers {
                id
            }
            recommendedBrowsers {
                id
            }
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
                isFinal
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
            metadata
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
                    versionString
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
                    metadata
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
                    versionString
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
                    metadata
                }
            }
        }
    }
`;
