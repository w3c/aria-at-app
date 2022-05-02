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
        testPlanVersions {
            id
            title
            gitSha
            gitMessage
            testPlan {
                directory
            }
            updatedAt
        }
        testPlanReports(statuses: [DRAFT, IN_REVIEW]) {
            id
            status
            conflicts {
                source {
                    locationOfData
                }
                conflictingResults {
                    locationOfData
                }
            }
            runnableTests {
                id
            }
            testPlanTarget {
                id
                title
                at {
                    id
                    name
                }
                browser {
                    id
                    name
                }
                atVersion
                browserVersion
            }
            testPlanVersion {
                id
                title
                gitSha
                gitMessage
                testPlan {
                    directory
                }
                updatedAt
            }
            draftTestPlanRuns {
                id
                tester {
                    id
                    username
                }
                testResults {
                    id
                    test {
                        id
                    }
                    completedAt
                }
            }
        }
        testPlans {
            latestTestPlanVersion {
                id
                gitSha
                testPlan {
                    id
                }
            }
        }
    }
`;

export const POPULATE_ADD_TEST_PLAN_TO_QUEUE_MODAL_QUERY = gql`
    query TestQueueAddTestPlanModal {
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
            browserVersions {
                id
                name
            }
        }
        testPlanVersions {
            id
            title
            gitSha
            gitMessage
            testPlan {
                directory
            }
            updatedAt
        }
    }
`;

export const ADD_TEST_QUEUE_MUTATION = gql`
    mutation AddTestPlanReport(
        $testPlanVersionId: ID!
        $atId: ID!
        $atVersion: String!
        $browserId: ID!
        $browserVersion: String!
    ) {
        findOrCreateTestPlanReport(
            input: {
                testPlanVersionId: $testPlanVersionId
                testPlanTarget: {
                    atId: $atId
                    atVersion: $atVersion
                    browserId: $browserId
                    browserVersion: $browserVersion
                }
            }
        ) {
            populatedData {
                testPlanReport {
                    id
                    status
                }
                testPlanTarget {
                    id
                    at {
                        id
                    }
                    atVersion
                    browser {
                        id
                    }
                    browserVersion
                }
                testPlanVersion {
                    id
                }
            }
            created {
                locationOfData
            }
        }
    }
`;

export const ASSIGN_TESTER_MUTATION = gql`
    mutation AssignTester($testReportId: ID!, $testerId: ID!) {
        testPlanReport(id: $testReportId) {
            assignTester(userId: $testerId) {
                testPlanReport {
                    draftTestPlanRuns {
                        tester {
                            id
                            username
                        }
                    }
                }
            }
        }
    }
`;

export const UPDATE_TEST_PLAN_REPORT_MUTATION = gql`
    mutation UpdateTestPlanReportStatus(
        $testReportId: ID!
        $status: TestPlanReportStatus!
    ) {
        testPlanReport(id: $testReportId) {
            updateStatus(status: $status) {
                testPlanReport {
                    status
                }
            }
        }
    }
`;

export const REMOVE_TEST_PLAN_REPORT_MUTATION = gql`
    mutation RemoveTestPlanReport($testReportId: ID!) {
        testPlanReport(id: $testReportId) {
            deleteTestPlanReport
        }
    }
`;

export const REMOVE_TESTER_MUTATION = gql`
    mutation RemoveTester($testReportId: ID!, $testerId: ID!) {
        testPlanReport(id: $testReportId) {
            deleteTestPlanRun(userId: $testerId) {
                testPlanReport {
                    draftTestPlanRuns {
                        tester {
                            id
                            username
                        }
                    }
                }
            }
        }
    }
`;

export const REMOVE_TESTER_RESULTS_MUTATION = gql`
    mutation RemoveTesterResult($testPlanRunId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            deleteTestResults {
                locationOfData
            }
        }
    }
`;
