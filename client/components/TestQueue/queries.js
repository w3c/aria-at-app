import { gql } from '@apollo/client';
import {
  AT_FIELDS,
  AT_VERSION_FIELDS,
  BROWSER_FIELDS,
  ME_FIELDS,
  TEST_PLAN_FIELDS,
  TEST_PLAN_REPORT_FIELDS,
  TEST_PLAN_REPORT_STATUS_FIELDS,
  TEST_PLAN_RUN_FIELDS,
  TEST_PLAN_VERSION_FIELDS,
  TEST_RESULT_FIELDS,
  ISSUE_FIELDS,
  USER_FIELDS
} from '@components/common/fragments';

export const TEST_QUEUE_PAGE_QUERY = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${BROWSER_FIELDS}
  ${ME_FIELDS}
  ${TEST_PLAN_FIELDS}
  ${TEST_PLAN_REPORT_FIELDS}
  ${TEST_PLAN_REPORT_STATUS_FIELDS()}
  ${TEST_PLAN_RUN_FIELDS}
  ${TEST_PLAN_VERSION_FIELDS}
  ${TEST_RESULT_FIELDS}
  ${USER_FIELDS}
  query TestQueuePage {
    me {
      ...MeFields
    }
    users {
      ...UserFields
      roles
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
      candidateBrowsers {
        ...BrowserFields
      }
      recommendedBrowsers {
        ...BrowserFields
      }
    }
    browsers {
      ...BrowserFields
    }
    testPlans(testPlanVersionPhases: [DRAFT, CANDIDATE, RECOMMENDED]) {
      ...TestPlanFields
      testPlanVersions {
        ...TestPlanVersionFields
        testPlanReports(isFinal: false) {
          ...TestPlanReportFields
          at {
            ...AtFields
            atVersions {
              ...AtVersionFields
            }
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
            testResultsLength
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

export const TEST_QUEUE_CONFLICTS_PAGE_QUERY = gql`
  ${ME_FIELDS}
  ${TEST_PLAN_REPORT_FIELDS}
  ${ISSUE_FIELDS('all')}
  ${TEST_PLAN_RUN_FIELDS}
  query TestQueueConflictsPage($testPlanReportId: ID!) {
    me {
      ...MeFields
    }
    testPlanReport(id: $testPlanReportId) {
      ...TestPlanReportFields
      testPlanVersion {
        title
        versionString
        id
        testPlan {
          directory
        }
      }
      minimumAtVersion {
        name
      }
      recommendedAtVersion {
        name
      }
      browser {
        name
      }
      at {
        name
      }
      runnableTests {
        id
      }
      issues {
        ...IssueFieldsAll
      }
      conflicts {
        conflictingResults {
          testPlanRun {
            ...TestPlanRunFields
          }
          test {
            id
            rowNumber
            title
            renderedUrl
          }
          scenario {
            commands {
              text
            }
          }
          scenarioResult {
            output
            unexpectedBehaviors {
              text
              details
              impact
            }
            assertionResults {
              assertion {
                text
              }
              passed
            }
          }
        }
      }
    }
  }
`;

export const ASSIGN_TESTER_MUTATION = gql`
  ${TEST_PLAN_RUN_FIELDS}
  mutation AssignTester(
    $testReportId: ID!
    $testerId: ID!
    $testPlanRunId: ID
  ) {
    testPlanReport(id: $testReportId) {
      assignTester(userId: $testerId, testPlanRunId: $testPlanRunId) {
        testPlanReport {
          draftTestPlanRuns {
            ...TestPlanRunFields
          }
        }
      }
    }
  }
`;

export const DELETE_TEST_PLAN_RUN = gql`
  ${TEST_PLAN_RUN_FIELDS}
  mutation DeleteTestPlanRun($testReportId: ID!, $testerId: ID!) {
    testPlanReport(id: $testReportId) {
      deleteTestPlanRun(userId: $testerId) {
        testPlanReport {
          id
          draftTestPlanRuns {
            ...TestPlanRunFields
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
