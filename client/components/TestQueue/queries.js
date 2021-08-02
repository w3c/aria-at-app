import { gql } from '@apollo/client';

export const TEST_QUEUE_PAGE_QUERY = gql`
    query {
        users {
            id
            username
            roles
        }
        testPlanReports(statuses: [DRAFT, IN_REVIEW]) {
            id
            status
            # conflictCount
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
                directory
                testCount
            }
            draftTestPlanRuns {
                id
                tester {
                    id
                    username
                }
                testResultCount
            }
        }
    }
`;

export const POPULATE_ADD_TEST_PLAN_TO_QUEUE_MODAL_QUERY = gql`
    query {
        ats {
            id
            name
            atVersions
        }
        browsers {
            id
            name
            browserVersions
        }
        testPlanVersions {
            id
            title
            gitSha
            directory
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
                locationOfData {
                    testPlanReportId
                    testPlanTargetId
                    browserId
                    browserVersion
                    atId
                    atVersion
                }
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
    mutation RemoveTester($testReportId: ID!, $testerId: ID!) {
        testPlanReport(id: $testReportId) {
            deleteTestPlanRunResults(userId: $testerId) {
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
