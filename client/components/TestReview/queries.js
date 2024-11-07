import { gql } from '@apollo/client';
import {
  AT_FIELDS,
  TEST_PLAN_VERSION_FIELDS,
  ISSUE_FIELDS
} from '@components/common/fragments';

export const TEST_REVIEW_PAGE_QUERY = gql`
  ${AT_FIELDS}
  ${TEST_PLAN_VERSION_FIELDS}
  ${ISSUE_FIELDS('all')}
  query TestReviewPageQuery($testPlanVersionId: ID!) {
    testPlanVersion(id: $testPlanVersionId) {
      ...TestPlanVersionFields
      testPlan {
        issues {
          ...IssueFieldsAll
          at {
            ...AtFields
          }
        }
      }
      tests {
        id
        title
        rowNumber
        ats {
          ...AtFields
        }
        renderedUrls {
          at {
            ...AtFields
          }
          renderedUrl
        }
        renderableContents {
          at {
            ...AtFields
          }
          renderableContent
        }
      }
    }
  }
`;
