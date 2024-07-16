import { gql } from '@apollo/client';

const TEST_PLAN_REPORT_FIELDS = (type = 'simple') => {
  switch (type) {
    case 'simple':
      return gql`
        fragment TestPlanReportFieldsSimple on TestPlanReport {
          __typename
          id
          metrics
          isFinal
          createdAt
          markedFinalAt
          conflictsLength
          runnableTestsLength
          vendorReviewStatus
        }
      `;
    case 'runs':
      return gql`
        fragment TestPlanReportFieldsRuns on TestPlanReport {
          __typename
          id
          draftTestPlanRuns {
            initiatedByAutomation
            tester {
              id
              username
              isBot
            }
          }
        }
      `;
  }
};

export default TEST_PLAN_REPORT_FIELDS;
