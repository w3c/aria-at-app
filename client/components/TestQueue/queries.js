import { gql } from '@apollo/client';
import {
  ME_FIELDS,
  USER_FIELDS,
  AT_FIELDS,
  AT_VERSION_FIELDS,
  BROWSER_FIELDS,
  TEST_PLAN_FIELDS,
  TEST_PLAN_VERSION_FIELDS,
  TEST_PLAN_REPORT_FIELDS,
  TEST_PLAN_RUN_FIELDS,
  TEST_RESULT_FIELDS,
  TEST_PLAN_REPORT_STATUS_FIELDS
} from '@components/common/fragments';

export const TEST_QUEUE_PAGE_QUERY = gql`
  ${ME_FIELDS}
  ${USER_FIELDS}
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${BROWSER_FIELDS}
  ${TEST_PLAN_FIELDS}
  ${TEST_PLAN_VERSION_FIELDS}
  ${TEST_PLAN_REPORT_FIELDS()}
  ${TEST_PLAN_RUN_FIELDS}
  ${TEST_RESULT_FIELDS}
  ${TEST_PLAN_REPORT_STATUS_FIELDS()}
  query TestQueuePage {
    me {
      ...MeFields
    }
    users {
      ...UserFields
      ats {
        ...AtFields
      }
    }
    ats {
      ...AtFields
      atVersions {
        ...AtVersionFields
      }
      browsers {
        ...BrowserFields
      }
    }
    testPlans(testPlanVersionPhases: [DRAFT, CANDIDATE, RECOMMENDED]) {
      ...TestPlanFields
      testPlanVersions {
        ...TestPlanVersionFields
        testPlanReports(isFinal: false) {
          ...TestPlanReportFieldsSimple
          at {
            ...AtFields
          }
          browser {
            ...BrowserFields
          }
          minimumAtVersion {
            ...AtVersionFields
          }
          exactAtVersion {
            ...AtVersionFields
          }
          draftTestPlanRuns {
            ...TestPlanRunFields
            testResults {
              ...TestResultFields
            }
          }
        }
        testPlanReportStatuses {
          ...TestPlanReportStatusFieldsSimple
        }
      }
    }
  }
`;

export const ASSIGN_TESTER_MUTATION = gql`
  ${TEST_PLAN_REPORT_FIELDS('runs')}
  mutation AssignTester(
    $testReportId: ID!
    $testerId: ID!
    $testPlanRunId: ID
  ) {
    testPlanReport(id: $testReportId) {
      assignTester(userId: $testerId, testPlanRunId: $testPlanRunId) {
        testPlanReport {
          ...TestPlanReportFieldsRuns
        }
      }
    }
  }
`;

export const DELETE_TEST_PLAN_RUN = gql`
  ${TEST_PLAN_REPORT_FIELDS('runs')}
  mutation DeleteTestPlanRun($testReportId: ID!, $testerId: ID!) {
    testPlanReport(id: $testReportId) {
      deleteTestPlanRun(userId: $testerId) {
        testPlanReport {
          ...TestPlanReportFieldsRuns
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
