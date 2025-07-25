import { gql } from '@apollo/client';

const TEST_PLAN_REPORT_STATUS_FIELDS = (type = 'simple') => {
  switch (type) {
    case 'simple':
      return gql`
        fragment TestPlanReportStatusFieldsSimple on TestPlanReportStatus {
          __typename
          testPlanReport {
            metrics
            draftTestPlanRuns {
              testResults {
                completedAt
              }
            }
          }
        }
      `;
    case 'all':
      return gql`
        fragment TestPlanReportStatusFieldsAll on TestPlanReportStatus {
          __typename
          isRequired
          at {
            id
            key
            name
            atVersions {
              id
              name
              releasedAt
              supportedByAutomation
            }
          }
          browser {
            id
            key
            name
          }
          minimumAtVersion {
            id
            name
            releasedAt
            supportedByAutomation
          }
          exactAtVersion {
            id
            name
            releasedAt
            supportedByAutomation
          }
          testPlanReport {
            id
            metrics
            percentComplete
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
      `;
  }
};

export default TEST_PLAN_REPORT_STATUS_FIELDS;
