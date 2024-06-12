import { gql } from '@apollo/client';

export const TEST_QUEUE_PAGE_QUERY = gql`
    query TestQueuePage {
        me {
            id
            username
            roles
        }
        users {
            id
            username
            roles
            isBot
            ats {
                id
                key
            }
        }
        ats {
            id
            key
            name
            atVersions {
                id
                name
            }
            browsers {
                id
                key
                name
            }
        }
        testPlans(testPlanVersionPhases: [DRAFT, CANDIDATE, RECOMMENDED]) {
            directory
            title
            testPlanVersions {
                id
                title
                phase
                versionString
                updatedAt
                gitSha
                gitMessage
                testPlanReports(isFinal: false) {
                    id
                    at {
                        id
                        key
                        name
                    }
                    browser {
                        id
                        key
                        name
                    }
                    minimumAtVersion {
                        id
                        name
                    }
                    exactAtVersion {
                        id
                        name
                    }
                    runnableTestsLength
                    conflictsLength
                    metrics
                    draftTestPlanRuns {
                        id
                        testResultsLength
                        initiatedByAutomation
                        tester {
                            id
                            username
                            isBot
                        }
                        testResults {
                            completedAt
                        }
                    }
                }
                testPlanReportStatuses {
                    testPlanReport {
                        metrics
                        draftTestPlanRuns {
                            testResults {
                                completedAt
                            }
                        }
                    }
                }
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
        }
        testPlanReports {
            id
        }
    }
`;

// export const TEST_PLAN_REPORT_QUERY = gql`
//     query TestPlanReport($testPlanReportId: ID!) {
//         testPlanReport(id: $testPlanReportId) {
//             id
//             at {
//                 id
//                 key
//                 name
//             }
//             browser {
//                 id
//                 key
//                 name
//             }
//             minimumAtVersion {
//                 id
//                 name
//             }
//             exactAtVersion {
//                 id
//                 name
//             }
//             runnableTestsLength
//             conflictsLength
//             metrics
//             draftTestPlanRuns {
//                 id
//                 testResultsLength
//                 initiatedByAutomation
//                 tester {
//                     id
//                     username
//                     isBot
//                 }
//                 testResults {
//                     completedAt
//                 }
//             }
//         }
//     }
// `;

export const ASSIGN_TESTER_MUTATION = gql`
    mutation AssignTester(
        $testReportId: ID!
        $testerId: ID!
        $testPlanRunId: ID
    ) {
        testPlanReport(id: $testReportId) {
            assignTester(userId: $testerId, testPlanRunId: $testPlanRunId) {
                testPlanReport {
                    draftTestPlanRuns {
                        initiatedByAutomation
                        tester {
                            id
                            username
                            isBot
                        }
                    }
                }
            }
        }
    }
`;

export const DELETE_TEST_PLAN_RUN = gql`
    mutation DeleteTestPlanRun($testReportId: ID!, $testerId: ID!) {
        testPlanReport(id: $testReportId) {
            deleteTestPlanRun(userId: $testerId) {
                testPlanReport {
                    id
                    draftTestPlanRuns {
                        id
                        tester {
                            id
                            username
                            isBot
                        }
                    }
                }
            }
        }
    }
`;

export const MARK_TEST_PLAN_REPORT_AS_FINAL_MUTATION = gql`
    mutation MarkTestPlanReportAsFinal(
        $testPlanReportId: ID!
        $primaryTestPlanRunId: ID!
    ) {
        testPlanReport(id: $testPlanReportId) {
            markAsFinal(primaryTestPlanRunId: $primaryTestPlanRunId) {
                testPlanReport {
                    markedFinalAt
                }
            }
        }
    }
`;

export const REMOVE_TEST_PLAN_REPORT_MUTATION = gql`
    mutation RemoveTestPlanReport($testPlanReportId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            deleteTestPlanReport
        }
    }
`;
