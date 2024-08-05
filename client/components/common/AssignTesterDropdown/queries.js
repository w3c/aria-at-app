import { gql } from '@apollo/client';
import {
  AT_FIELDS,
  BROWSER_FIELDS,
  USER_FIELDS
} from '@components/common/fragments';

export const ASSIGN_TESTER_MUTATION = gql`
  ${USER_FIELDS}
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
              ...UserFields
            }
          }
        }
      }
    }
  }
`;

export const REMOVE_TESTER_MUTATION = gql`
  ${USER_FIELDS}
  mutation RemoveTester($testReportId: ID!, $testerId: ID!) {
    testPlanReport(id: $testReportId) {
      deleteTestPlanRun(userId: $testerId) {
        testPlanReport {
          draftTestPlanRuns {
            tester {
              ...UserFields
            }
          }
        }
      }
    }
  }
`;

export const TEST_PLAN_REPORT_AT_BROWSER_QUERY = gql`
  ${AT_FIELDS}
  ${BROWSER_FIELDS}
  query TestPlanReportAtBrowser($testPlanReportId: ID!) {
    testPlanReport(id: $testPlanReportId) {
      id
      at {
        ...AtFields
      }
      browser {
        ...BrowserFields
      }
    }
  }
`;
