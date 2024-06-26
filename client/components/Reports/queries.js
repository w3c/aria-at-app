import { gql } from '@apollo/client';

export const REPORTS_PAGE_QUERY = gql`
  query ReportsPageQuery {
    testPlanVersions(phases: [CANDIDATE, RECOMMENDED]) {
      id
      title
      phase
      gitSha
      updatedAt
      testPlan {
        directory
      }
      metadata
      testPlanReports(isFinal: true) {
        id
        metrics
        at {
          id
          name
        }
        browser {
          id
          name
        }
      }
    }
  }
`;

export const REPORT_PAGE_QUERY = gql`
  query ReportPageQuery($testPlanVersionId: ID) {
    testPlanVersion(id: $testPlanVersionId) {
      id
      title
      phase
      gitSha
      versionString
      testPlan {
        directory
      }
      metadata
      testPlanReports(isFinal: true) {
        id
        metrics
        markedFinalAt
        at {
          id
          name
        }
        browser {
          id
          name
        }
        recommendedAtVersion {
          id
          name
          releasedAt
        }
        runnableTests {
          id
          title
          renderedUrl
        }
        finalizedTestResults {
          id
          test {
            id
            rowNumber
            title
            renderedUrl
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
          atVersion {
            name
          }
          browserVersion {
            name
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
  }
`;
