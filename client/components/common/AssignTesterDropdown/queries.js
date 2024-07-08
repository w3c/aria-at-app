import { gql } from '@apollo/client';

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

export const REMOVE_TESTER_MUTATION = gql`
  mutation RemoveTester($testReportId: ID!, $testerId: ID!) {
    testPlanReport(id: $testReportId) {
      deleteTestPlanRun(userId: $testerId) {
        testPlanReport {
          draftTestPlanRuns {
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

export const TEST_PLAN_REPORT_AT_BROWSER_QUERY = gql`
  query TestPlanReportAtBrowser($testPlanReportId: ID!) {
    testPlanReport(id: $testPlanReportId) {
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
    }
  }
`;
