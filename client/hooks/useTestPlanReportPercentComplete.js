import { useQuery, gql } from '@apollo/client';

const TEST_PLAN_REPORT_PERCENT_QUERY = gql`
  query TestPlanReportPercent($testPlanReportId: ID!) {
    testPlanReport(id: $testPlanReportId) {
      id
      percentComplete
    }
  }
`;

export const useTestPlanReportPercentComplete = (
  testPlanReportId,
  pollInterval = 2000
) => {
  const { data } = useQuery(TEST_PLAN_REPORT_PERCENT_QUERY, {
    variables: { testPlanReportId },
    fetchPolicy: 'cache-and-network',
    pollInterval: pollInterval ?? undefined
  });

  return {
    percentComplete: data?.testPlanReport?.percentComplete
  };
};
