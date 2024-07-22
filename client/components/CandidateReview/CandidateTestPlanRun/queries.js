import { gql } from '@apollo/client';

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
  query CandidateReportsQuery(
    $atId: ID!
    $testPlanVersionId: ID
    $testPlanVersionIds: [ID]
  ) {
    me {
      id
      roles
      username
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
        author
        isCandidateReview
        feedbackType
        testNumberFilteredByAt
        link
      }
      at {
        id
        name
      }
      latestAtVersionReleasedAt {
        id
        name
        releasedAt
      }
      browser {
        id
        name
      }
      testPlanVersion {
        id
        title
        phase
        gitSha
        testPlan {
          directory
        }
        metadata
        testPageUrl
        updatedAt
        versionString
        candidatePhaseReachedAt
        recommendedPhaseTargetDate
      }
      runnableTests {
        id
        title
        rowNumber
        renderedUrl
        renderableContent
        viewers {
          username
        }
      }
      finalizedTestResults {
        id
        completedAt
        test {
          id
          rowNumber
          title
          renderedUrl
          renderableContent
        }
        scenarioResults {
          id
          scenario {
            commands {
              id
              text
            }
          }
          output
          assertionResults {
            id
            assertion {
              text
              phrase
            }
            passed
          }
          mustAssertionResults: assertionResults(priority: MUST) {
            assertion {
              text
              phrase
            }
            passed
          }
          shouldAssertionResults: assertionResults(priority: SHOULD) {
            assertion {
              text
              phrase
            }
            passed
          }
          mayAssertionResults: assertionResults(priority: MAY) {
            assertion {
              text
              phrase
            }
            passed
          }
          unexpectedBehaviors {
            id
            text
            impact
            details
          }
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
          test {
            id
          }
          atVersion {
            id
            name
          }
          browserVersion {
            id
            name
          }
          completedAt
        }
      }
    }
  }
`;
