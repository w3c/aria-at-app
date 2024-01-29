import { gql } from '@apollo/client';
import {
    TEST_PLAN_RUN_FIELDS,
    TEST_PLAN_REPORT_FIELDS
} from '../common/queries';

export const TEST_RUN_PAGE_QUERY = gql`
    ${TEST_PLAN_RUN_FIELDS}
    query TestPlanRunPage($testPlanRunId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            ...TestPlanRunFields
        }
        me {
            id
            username
            roles
        }
        users {
            id
            username
        }
    }
`;

export const TEST_RUN_PAGE_ANON_QUERY = gql`
    ${TEST_PLAN_REPORT_FIELDS}
    query TestPlanRunAnonPage($testPlanReportId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            ...TestPlanReportFields
        }
    }
`;

export const FIND_OR_CREATE_TEST_RESULT_MUTATION = gql`
    ${TEST_PLAN_RUN_FIELDS}
    ${TEST_PLAN_REPORT_FIELDS}
    mutation FindOrCreateTestResult(
        $testPlanRunId: ID!
        $testId: ID!
        $atVersionId: ID!
        $browserVersionId: ID!
    ) {
        testPlanRun(id: $testPlanRunId) {
            findOrCreateTestResult(
                testId: $testId
                atVersionId: $atVersionId
                browserVersionId: $browserVersionId
            ) {
                locationOfData
                testPlanRun {
                    ...TestPlanRunFields
                }
                testPlanReport {
                    ...TestPlanReportFields
                }
            }
        }
    }
`;

export const SAVE_TEST_RESULT_MUTATION = gql`
    ${TEST_PLAN_RUN_FIELDS}
    ${TEST_PLAN_REPORT_FIELDS}
    mutation SaveTestResult(
        $id: ID!
        $atVersionId: ID!
        $browserVersionId: ID!
        $scenarioResults: [ScenarioResultInput]!
    ) {
        testResult(id: $id) {
            saveTestResult(
                input: {
                    id: $id
                    atVersionId: $atVersionId
                    browserVersionId: $browserVersionId
                    scenarioResults: $scenarioResults
                }
            ) {
                locationOfData
                testPlanRun {
                    ...TestPlanRunFields
                }
                testPlanReport {
                    ...TestPlanReportFields
                }
            }
        }
    }
`;

export const SUBMIT_TEST_RESULT_MUTATION = gql`
    ${TEST_PLAN_RUN_FIELDS}
    ${TEST_PLAN_REPORT_FIELDS}
    mutation SubmitTestResult(
        $id: ID!
        $atVersionId: ID!
        $browserVersionId: ID!
        $scenarioResults: [ScenarioResultInput]!
    ) {
        testResult(id: $id) {
            submitTestResult(
                input: {
                    id: $id
                    atVersionId: $atVersionId
                    browserVersionId: $browserVersionId
                    scenarioResults: $scenarioResults
                }
            ) {
                locationOfData
                testPlanRun {
                    ...TestPlanRunFields
                }
                testPlanReport {
                    ...TestPlanReportFields
                }
            }
        }
    }
`;

export const DELETE_TEST_RESULT_MUTATION = gql`
    mutation DeleteTestResult($id: ID!) {
        testResult(id: $id) {
            deleteTestResult {
                locationOfData
            }
        }
    }
`;

export const FIND_OR_CREATE_BROWSER_VERSION_MUTATION = gql`
    mutation FindOrCreateBrowserVersion(
        $browserId: ID!
        $browserVersionName: String!
    ) {
        browser(id: $browserId) {
            findOrCreateBrowserVersion(input: { name: $browserVersionName }) {
                id
                name
            }
        }
    }
`;

export const COLLECTION_JOB_STATUS_BY_TEST_PLAN_RUN_ID_QUERY = gql`
    query CollectionJobIdByTestPlanRunId($testPlanRunId: ID!) {
        collectionJobByTestPlanRunId(testPlanRunId: $testPlanRunId) {
            id
            status
            externalLogsUrl
        }
    }
`;
