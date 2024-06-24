import { gql } from '@apollo/client';

export const TEST_PLAN_REPORT_STATUS_DIALOG_QUERY = gql`
  query TestPlanReportStatusDialog($testPlanVersionId: ID!) {
    testPlanVersion(id: $testPlanVersionId) {
      id
      title
      phase
      gitSha
      gitMessage
      updatedAt
      draftPhaseReachedAt
      candidatePhaseReachedAt
      recommendedPhaseTargetDate
      recommendedPhaseReachedAt
      testPlan {
        directory
      }
      testPlanReportStatuses {
        isRequired
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
        minimumAtVersion {
          id
          name
        }
        exactAtVersion {
          id
          name
        }
        testPlanReport {
          id
          metrics
          isFinal
          markedFinalAt
          issues {
            link
            isOpen
            feedbackType
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
    }
  }
`;
