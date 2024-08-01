import { gql } from '@apollo/client';
import {
  AT_FIELDS,
  AT_VERSION_FIELDS,
  BROWSER_FIELDS,
  BROWSER_VERSION_FIELDS,
  ISSUE_FIELDS,
  ME_FIELDS,
  SCENARIO_RESULT_FIELDS,
  TEST_FIELDS,
  TEST_RESULT_FIELDS
} from '@components/common/fragments';

export const ADD_VIEWER_MUTATION = gql`
  mutation AddViewerMutation($testPlanVersionId: ID!, $testId: ID!) {
    addViewer(testPlanVersionId: $testPlanVersionId, testId: $testId) {
      username
    }
  }
`;

export const PROMOTE_VENDOR_REVIEW_STATUS_REPORT_MUTATION = gql`
  mutation UpdateVendorReviewStatusReport(
    $testReportId: ID!
    $reviewStatus: String!
  ) {
    testPlanReport(id: $testReportId) {
      promoteVendorReviewStatus(vendorReviewStatus: $reviewStatus) {
        testPlanReport {
          id
          vendorReviewStatus
        }
      }
    }
  }
`;

export const CANDIDATE_REPORTS_QUERY = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${BROWSER_FIELDS}
  ${BROWSER_VERSION_FIELDS}
  ${ISSUE_FIELDS('all')}
  ${ME_FIELDS}
  ${TEST_FIELDS()}
  ${TEST_RESULT_FIELDS}
  ${SCENARIO_RESULT_FIELDS('all')}
  query CandidateReportsQuery(
    $atId: ID!
    $testPlanVersionId: ID
    $testPlanVersionIds: [ID]
  ) {
    me {
      ...MeFields
    }
    testPlanReports(
      atId: $atId
      testPlanVersionPhases: [CANDIDATE]
      testPlanVersionId: $testPlanVersionId
      testPlanVersionIds: $testPlanVersionIds
      isFinal: true
    ) {
      id
      vendorReviewStatus
      issues {
        ...IssueFieldsAll
      }
      at {
        ...AtFields
      }
      latestAtVersionReleasedAt {
        ...AtVersionFields
      }
      browser {
        ...BrowserFields
      }
      testPlanVersion {
        id
        title
        phase
        gitSha
        versionString
        updatedAt
        candidatePhaseReachedAt
        recommendedPhaseTargetDate
        testPageUrl
        metadata
        testPlan {
          directory
        }
      }
      runnableTests {
        ...TestFieldsSimple
        renderableContent
        viewers {
          username
        }
      }
      finalizedTestResults {
        ...TestResultFields
        test {
          ...TestFieldsSimple
          renderableContent
        }
        scenarioResults {
          ...ScenarioResultFieldsAll
        }
      }
      draftTestPlanRuns {
        tester {
          username
        }
        testPlanReport {
          id
        }
        testResults {
          ...TestResultFields
          test {
            id
          }
          atVersion {
            ...AtVersionFields
          }
          browserVersion {
            ...BrowserVersionFields
          }
        }
      }
    }
  }
`;
