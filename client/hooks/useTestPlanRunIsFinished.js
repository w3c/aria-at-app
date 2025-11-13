import { useMemo } from 'react';

const { gql, useQuery } = require('@apollo/client');

const TEST_PLAN_RUN_TEST_RESULTS_COMPLETION_STATUS = gql`
  query TestPlanRunTestResultsCompletionStatus($testPlanRunId: ID!) {
    testPlanRun(id: $testPlanRunId) {
      id
      testResults {
        id
        completedAt
      }
    }
  }
`;

/**
 * @typedef {Object} UseTestPlanRunIsFinishedReturn
 * @property {boolean} runIsFinished - True if all test results have completedAt set, false otherwise
 */

/**
 * Hook to determine if a test plan run is finished by checking if all test results
 * have a completedAt timestamp.
 *
 * @param {string} testPlanRunId - The ID of the test plan run to check
 * @returns {UseTestPlanRunIsFinishedReturn}
 */
export const useTestPlanRunIsFinished = testPlanRunId => {
  const { data: testPlanRunCompletionQuery } = useQuery(
    TEST_PLAN_RUN_TEST_RESULTS_COMPLETION_STATUS,
    {
      variables: {
        testPlanRunId
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    }
  );

  const runIsFinished = useMemo(() => {
    if (!testPlanRunCompletionQuery?.testPlanRun?.testResults.length) {
      return false;
    }

    return testPlanRunCompletionQuery.testPlanRun.testResults.every(
      testResult => testResult.completedAt !== null
    );
  }, [testPlanRunId, testPlanRunCompletionQuery]);

  return { runIsFinished };
};
