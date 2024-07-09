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
  TEST_PLAN_RUN_FIELDS
} from '@components/common/fragments';

export const TEST_QUEUE_PAGE_QUERY = gql`
  ${ME_FIELDS}
  ${USER_FIELDS}
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${BROWSER_FIELDS}
  ${TEST_PLAN_FIELDS}
  ${TEST_PLAN_VERSION_FIELDS}
  ${TEST_PLAN_REPORT_FIELDS}
  ${TEST_PLAN_RUN_FIELDS}
  query TestQueuePage {
    me {
      ...ME_FIELDS
    }
    users {
      ...USER_FIELDS
      ats {
        ...AT_FIELDS
      }
    }
    ats {
      ...AT_FIELDS
      atVersions {
        ...AT_VERSION_FIELDS
      }
      browsers {
        ...BROWSER_FIELDS
      }
    }
    testPlans(testPlanVersionPhases: [DRAFT, CANDIDATE, RECOMMENDED]) {
      ...TEST_PLAN_FIELDS
      testPlanVersions {
        ...TEST_PLAN_VERSION_FIELDS
        testPlanReports(isFinal: false) {
          ...TEST_PLAN_REPORT_FIELDS
          at {
            ...AT_FIELDS
          }
          browser {
            ...BROWSER_FIELDS
          }
          minimumAtVersion {
            ...AT_VERSION_FIELDS
          }
          exactAtVersion {
            ...AT_VERSION_FIELDS
          }
          draftTestPlanRuns {
            ...TEST_PLAN_RUN_FIELDS
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
