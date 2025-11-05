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
        rawLinkText
        value
        rawValue
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
        rawLinkText
        value
        rawValue
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
        rawLinkText
        value
        rawValue
        total
        passed
        failed
        untestable
        passedPercentage
        formatted
        atName
        browserName
        atId
        browserId
      }
      htmlFeaturesByAtBrowser {
        refId
        type
        linkText
        rawLinkText
        value
        rawValue
        total
        passed
        failed
        untestable
        passedPercentage
        formatted
        atName
        browserName
        atId
        browserId
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

export const ARIA_HTML_FEATURE_DETAIL_REPORT_QUERY = gql`
  ${AT_FIELDS}
  ${BROWSER_FIELDS}
  query AriaHtmlFeatureDetailReport(
    $refId: String!
    $atId: ID!
    $browserId: ID!
  ) {
    ariaHtmlFeatureDetailReport(
      refId: $refId
      atId: $atId
      browserId: $browserId
    ) {
      feature {
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
      at {
        ...AtFields
      }
      browser {
        ...BrowserFields
      }
      assertionStatistics {
        label
        passingCount
        passingTotal
        failingCount
        failingTotal
        untestableCount
        untestableTotal
        passingPercentage
        failingPercentage
        untestablePercentage
      }
      rows {
        testPlanName
        testPlanVersion
        testPlanVersionId
        testPlanReportId
        testTitle
        testId
        testResultId
        commandSequence
        assertionPriority
        assertionPhrase
        result
        testedOn
        atVersion
        browserVersion
        severeSideEffectsCount
        moderateSideEffectsCount
      }
    }
  }
`;
