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
    onHold
    conflictsLength
    runnableTestsLength
    percentComplete
  }
`;

export default TEST_PLAN_REPORT_FIELDS;
