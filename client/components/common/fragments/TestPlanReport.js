import { gql } from '@apollo/client';

const TEST_PLAN_REPORT_FIELDS = gql`
  fragment TestPlanReportFields on TestPlanReport {
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

export default TEST_PLAN_REPORT_FIELDS;
