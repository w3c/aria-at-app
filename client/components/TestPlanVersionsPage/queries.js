import { gql } from '@apollo/client';
import {
  AT_FIELDS,
  ISSUE_FIELDS,
  TEST_PLAN_FIELDS,
  TEST_PLAN_REPORT_FIELDS,
  TEST_PLAN_VERSION_FIELDS
} from '@components/common/fragments';

export const TEST_PLAN_VERSIONS_PAGE_QUERY = gql`
  ${AT_FIELDS}
  ${ISSUE_FIELDS('all')}
  ${TEST_PLAN_FIELDS}
  ${TEST_PLAN_REPORT_FIELDS}
  ${TEST_PLAN_VERSION_FIELDS}
  query TestPlanVersionsPageQuery($testPlanDirectory: ID!) {
    ats {
      ...AtFields
    }
    testPlan(id: $testPlanDirectory) {
      ...TestPlanFields
      issues {
        ...IssueFieldsAll
        at {
          ...AtFields
        }
      }
      testPlanVersions {
        ...TestPlanVersionFields
        testPlanReports {
          ...TestPlanReportFields
          at {
            ...AtFields
          }
        }
      }
    }
  }
`;
