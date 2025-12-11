import { useQuery, gql } from '@apollo/client';

const TEST_PLAN_REPORT_PERCENT_QUERY = gql`
  query TestPlanReportPercent($testPlanReportId: ID!) {
    testPlanReport(id: $testPlanReportId) {
      id
      percentComplete
    }
  }
`;

/**
 * @typedef {Object} UseTestPlanReportPercentCompleteReturn
 * @property {number|undefined} percentComplete - The percent complete value from the test plan report
 */

/**
 * Hook to fetch and poll the percent complete value for a test plan report.
 *
 * @param {string} testPlanReportId - The ID of the test plan report
 * @param {number} [pollInterval=2000] - Polling interval in milliseconds. Set to null or undefined to disable polling
 * @returns {UseTestPlanReportPercentCompleteReturn}
 */
export const useTestPlanReportPercentComplete = (
  testPlanReportId,
  pollInterval = 2000
) => {
  const { data } = useQuery(TEST_PLAN_REPORT_PERCENT_QUERY, {
    variables: { testPlanReportId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    pollInterval: pollInterval ?? undefined
  });

  return {
    percentComplete: data?.testPlanReport?.percentComplete
  };
};
