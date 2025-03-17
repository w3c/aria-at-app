import { gql } from '@apollo/client';
import {
  AT_FIELDS,
  AT_VERSION_FIELDS,
  BROWSER_FIELDS,
  ISSUE_FIELDS
} from '@components/common/fragments';

export const CANDIDATE_REVIEW_PAGE_QUERY = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${BROWSER_FIELDS}
  ${ISSUE_FIELDS()}
  query {
    ats {
      ...AtFields
    }
    testPlanVersions(phases: [CANDIDATE]) {
      id
      title
      phase
      gitSha
      versionString
      updatedAt
      candidatePhaseReachedAt
      recommendedPhaseTargetDate
      metadata
      testPlan {
        directory
      }
      testPlanReports(isFinal: true) {
        id
        metrics
        vendorReviewStatus
        at {
          ...AtFields
        }
        latestAtVersionReleasedAt {
          ...AtVersionFields
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
`;
