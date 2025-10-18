import { gql } from '@apollo/client';
import {
  AT_FIELDS,
  AT_VERSION_FIELDS,
  BROWSER_FIELDS,
  BROWSER_VERSION_FIELDS,
  SCENARIO_RESULT_FIELDS,
  TEST_FIELDS,
  TEST_RESULT_FIELDS
} from '@components/common/fragments';

export const REPORTS_PAGE_QUERY = gql`
  ${AT_FIELDS}
  ${BROWSER_FIELDS}
  query ReportsPageQuery {
    testPlanVersions(phases: [CANDIDATE, RECOMMENDED]) {
      id
      title
      phase
      gitSha
      updatedAt
      versionString
      metadata
      testPlan {
        directory
      }
      testPlanReports(isFinal: true) {
        id
        metrics
        at {
          ...AtFields
        }
        browser {
          ...BrowserFields
        }
      }
    }

    ariaHtmlFeaturesMetrics {
      ariaFeaturesPassedCount
      ariaFeaturesCount
      ariaFeaturesFailedCount
      ariaFeaturesUntestableCount
      htmlFeaturesPassedCount
      htmlFeaturesCount
      htmlFeaturesFailedCount
      htmlFeaturesUntestableCount
      ariaFeatures {
        refId
        type
        linkText
        value
        total
        passed
        failed
        untestable
        passedPercentage
        formatted
      }
      htmlFeatures {
        refId
        type
        linkText
        value
        total
        passed
        failed
        untestable
        passedPercentage
        formatted
      }
      ariaFeaturesByAtBrowser {
        refId
        type
        linkText
        value
        total
        passed
        failed
        untestable
        passedPercentage
        formatted
        atName
        browserName
      }
      htmlFeaturesByAtBrowser {
        refId
        type
        linkText
        value
        total
        passed
        failed
        untestable
        passedPercentage
        formatted
        atName
        browserName
      }
    }
  }
`;

export const REPORT_PAGE_QUERY = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${BROWSER_FIELDS}
  ${BROWSER_VERSION_FIELDS}
  ${SCENARIO_RESULT_FIELDS('all')}
  ${TEST_FIELDS()}
  ${TEST_RESULT_FIELDS}
  query ReportPageQuery($testPlanVersionId: ID) {
    testPlanVersion(id: $testPlanVersionId) {
      id
      title
      phase
      gitSha
      updatedAt
      versionString
      metadata
      testPlan {
        directory
      }
      testPlanReports(isFinal: true) {
        id
        metrics
        markedFinalAt
        at {
          ...AtFields
        }
        browser {
          ...BrowserFields
        }
        recommendedAtVersion {
          ...AtVersionFields
        }
        runnableTests {
          ...TestFieldsSimple
        }
        finalizedTestResults {
          ...TestResultFields
          test {
            ...TestFieldsSimple
          }
          scenarioResults {
            ...ScenarioResultFieldsAll
          }
          atVersion {
            ...AtVersionFields
          }
          browserVersion {
            ...BrowserVersionFields
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
  }
`;
