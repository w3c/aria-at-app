import { gql } from '@apollo/client';

const TEST_PLAN_REPORT_FIELDS = gql`
  fragment TestPlanReportFields on TestPlanReport {
    __typename
    id
    metrics
    isFinal
    isRerun
    createdAt
    markedFinalAt
    conflictsLength
    runnableTestsLength
    percentComplete
    historicalReport {
      id
      createdAt
      markedFinalAt
      at {
        id
        name
      }
      exactAtVersion {
        id
        name
      }
      minimumAtVersion {
        id
        name
      }
    }
  }
`;

export default TEST_PLAN_REPORT_FIELDS;
