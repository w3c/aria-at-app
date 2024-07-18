import { gql } from '@apollo/client';
import {
  AT_FIELDS,
  AT_VERSION_FIELDS,
  BROWSER_FIELDS,
  BROWSER_VERSION_FIELDS,
  ISSUE_FIELDS,
  ME_FIELDS,
  TEST_PLAN_FIELDS,
  TEST_PLAN_REPORT_FIELDS,
  TEST_PLAN_VERSION_FIELDS,
  TEST_RESULT_FIELDS
} from '@components/common/fragments';

export const DATA_MANAGEMENT_PAGE_QUERY = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${BROWSER_FIELDS}
  ${BROWSER_VERSION_FIELDS}
  ${ISSUE_FIELDS()}
  ${ME_FIELDS}
  ${TEST_PLAN_FIELDS}
  ${TEST_PLAN_REPORT_FIELDS}
  ${TEST_RESULT_FIELDS}
  query DataManagementPage {
    me {
      ...MeFields
    }
    ats {
      ...AtFields
      browsers {
        ...BrowserFields
      }
      atVersions {
        ...AtVersionFields
      }
      candidateBrowsers {
        id
      }
      recommendedBrowsers {
        id
      }
    }
    testPlans {
      ...TestPlanFields
    }
    # TODO: Understand why using ...TestPlanVersionFields here causes query issues
    deprecatedTestPlanVersions: testPlanVersions(phases: [DEPRECATED]) {
      id
      phase
      updatedAt
      draftPhaseReachedAt
      candidatePhaseReachedAt
      recommendedPhaseTargetDate
      recommendedPhaseReachedAt
      deprecatedAt
      testPlan {
        directory
      }
    }
    # TODO: Understand why using ...TestPlanVersionFields here causes query issues
    testPlanVersions(phases: [RD, DRAFT, CANDIDATE, RECOMMENDED]) {
      id
      title
      phase
      gitSha
      gitMessage
      updatedAt
      versionString
      draftPhaseReachedAt
      candidatePhaseReachedAt
      recommendedPhaseTargetDate
      recommendedPhaseReachedAt
      metadata
      testPlan {
        directory
      }
      testPlanReports {
        ...TestPlanReportFields
        at {
          ...AtFields
        }
        browser {
          ...BrowserFields
        }
        issues {
          ...IssueFieldsSimple
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

export const UPDATE_TEST_PLAN_VERSION_PHASE = gql`
  ${AT_FIELDS}
  ${BROWSER_FIELDS}
  ${ISSUE_FIELDS()}
  ${TEST_PLAN_VERSION_FIELDS}
  mutation UpdateTestPlanVersionPhase(
    $testPlanVersionId: ID!
    $phase: TestPlanVersionPhase!
    $testPlanVersionDataToIncludeId: ID
  ) {
    testPlanVersion(id: $testPlanVersionId) {
      updatePhase(
        phase: $phase
        testPlanVersionDataToIncludeId: $testPlanVersionDataToIncludeId
      ) {
        testPlanVersion {
          ...TestPlanVersionFields
          testPlanReports {
            id
            at {
              ...AtFields
            }
            browser {
              ...BrowserFields
            }
            issues {
              ...IssueFieldsSimple
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_TEST_PLAN_VERSION_RECOMMENDED_TARGET_DATE = gql`
  ${AT_FIELDS}
  ${BROWSER_FIELDS}
  ${ISSUE_FIELDS()}
  ${TEST_PLAN_VERSION_FIELDS}
  mutation UpdateTestPlanReportRecommendedTargetDate(
    $testPlanVersionId: ID!
    $recommendedPhaseTargetDate: Timestamp!
  ) {
    testPlanVersion(id: $testPlanVersionId) {
      updateRecommendedPhaseTargetDate(
        recommendedPhaseTargetDate: $recommendedPhaseTargetDate
      ) {
        testPlanVersion {
          ...TestPlanVersionFields
          testPlanReports {
            id
            at {
              ...AtFields
            }
            browser {
              ...BrowserFields
            }
            issues {
              ...IssueFieldsSimple
            }
          }
        }
      }
    }
  }
`;
