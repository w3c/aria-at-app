import { gql } from '@apollo/client';
import {
  TEST_PLAN_REPORT_STATUS_FIELDS,
  TEST_PLAN_VERSION_FIELDS,
  SCENARIO_RESULT_FIELDS
} from '@components/common/fragments';

export const TEST_PLAN_REPORT_STATUS_DIALOG_QUERY = gql`
  ${TEST_PLAN_REPORT_STATUS_FIELDS('all')}
  ${TEST_PLAN_VERSION_FIELDS}
  ${SCENARIO_RESULT_FIELDS('all')}
  query TestPlanReportStatusDialog($testPlanVersionId: ID!) {
    testPlanVersion(id: $testPlanVersionId) {
      ...TestPlanVersionFields
      testPlanReportStatuses {
        ...TestPlanReportStatusFieldsAll
        testPlanReport {
          draftTestPlanRuns {
            testResults {
              id
              scenarioResults {
                ...ScenarioResultFieldsAll
              }
            }
          }
        }
      }
    }
  }
`;
