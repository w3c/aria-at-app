import { gql } from '@apollo/client';
import {
  AT_FIELDS,
  AT_VERSION_FIELDS,
  BROWSER_FIELDS,
  ME_FIELDS,
  TEST_PLAN_FIELDS,
  TEST_PLAN_REPORT_FIELDS,
  TEST_PLAN_RUN_FIELDS,
  ISSUE_FIELDS,
  USER_FIELDS
} from '@components/common/fragments';

export const TEST_QUEUE_PAGE_QUERY = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${BROWSER_FIELDS}
  ${ME_FIELDS}
  ${TEST_PLAN_FIELDS}
  ${USER_FIELDS}
  query TestQueuePage {
    me {
      ...MeFields
    }
    users {
      ...UserFields
      roles
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
        __typename
        id
        title
        phase
        versionString
        updatedAt
        draftPhaseReachedAt
        candidatePhaseReachedAt
        recommendedPhaseReachedAt
        recommendedPhaseTargetDate
        deprecatedAt
        testPlanReports(isFinal: false) {
          id
          at {
            name
          }
          browser {
            name
          }
          draftTestPlanRuns {
            id
            isRerun
          }
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
          atVersion {
            name
          }
          browserVersion {
            name
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
            hasNegativeSideEffect
            negativeSideEffects {
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

export const SET_ON_HOLD_MUTATION = gql`
  mutation SetOnHold($testPlanReportId: ID!, $onHold: Boolean!) {
    testPlanReport(id: $testPlanReportId) {
      setOnHold(onHold: $onHold) {
        testPlanReport {
          id
          onHold
        }
      }
    }
  }
`;

export const TEST_QUEUE_EXPANDED_ROW_QUERY = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${BROWSER_FIELDS}
  ${TEST_PLAN_REPORT_FIELDS}
  ${TEST_PLAN_RUN_FIELDS}
  query TestQueueExpandedRow($testPlanReportId: ID!) {
    testPlanReport(id: $testPlanReportId) {
      ...TestPlanReportFields
      totalScenarioCount
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
      }
    }
  }
`;

export const ADD_TEST_PLANS_QUERY = gql`
  ${TEST_PLAN_FIELDS}
  query AddTestPlans($testPlanVersionPhases: [TestPlanVersionPhase!]!) {
    testPlans(testPlanVersionPhases: $testPlanVersionPhases) {
      ...TestPlanFields
      testPlanVersions {
        __typename
        id
        gitSha
        gitMessage
      }
    }
  }
`;
