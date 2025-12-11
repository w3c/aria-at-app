import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY } from '../components/TestQueueRunCompletionStatus/queries';

/**
 * @typedef {Object} TestPlanRun
 * @property {string} id - The test plan run ID
 */

/**
 * @typedef {Object} UseTestPlanRunValidatedAssertionCountsReturn
 * @property {number} testResultsLength - Number of test results in the run
 * @property {number} totalPossibleAssertions - Total number of possible assertions
 * @property {number} totalValidatedAssertions - Count of assertions with passed !== null
 * @property {number} completedResponses - Count of completed scenario results (outputs)
 * @property {Function} refetch - Function to manually refetch the data
 * @property {Function} [startPolling] - Function to start polling (only if pollInterval provided)
 * @property {Function} [stopPolling] - Function to stop polling (only if pollInterval provided)
 */

/**
 * Hook to fetch and calculate validated assertion counts and completion statistics
 * for a test plan run. Supports optional polling for real-time updates.
 *
 * @param {TestPlanRun} testPlanRun - The test plan run object containing an id property
 * @param {number|null} [pollInterval=null] - Optional polling interval in milliseconds.
 *   If provided, returns startPolling and stopPolling functions
 * @returns {UseTestPlanRunValidatedAssertionCountsReturn}
 */
export const useTestPlanRunValidatedAssertionCounts = (
  testPlanRun,
  pollInterval = null
) => {
  const {
    data: testPlanRunAssertionsQueryResult,
    startPolling,
    stopPolling,
    refetch
  } = useQuery(TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY, {
    variables: {
      testPlanRunId: testPlanRun.id
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    pollInterval
  });

  const testResultsLength = useMemo(() => {
    return (
      testPlanRunAssertionsQueryResult?.testPlanRun?.testResults?.length || 0
    );
  }, [testPlanRunAssertionsQueryResult]);

  const totalPossibleAssertions = useMemo(() => {
    const tpr = testPlanRunAssertionsQueryResult?.testPlanRun?.testPlanReport;
    return tpr?.totalPossibleAssertions || 0;
  }, [testPlanRunAssertionsQueryResult]);

  const totalValidatedAssertions = useMemo(() => {
    if (!testPlanRunAssertionsQueryResult?.testPlanRun) {
      return 0;
    }

    const {
      testPlanRun: { testResults }
    } = testPlanRunAssertionsQueryResult;
    return testResults.reduce((acc, test) => {
      return (
        acc +
        test.scenarioResults.reduce((acc, scenario) => {
          return (
            acc +
            scenario.assertionResults.reduce(
              (acc, assertion) => acc + (assertion.passed !== null ? 1 : 0),
              0
            )
          );
        }, 0)
      );
    }, 0);
  }, [testPlanRunAssertionsQueryResult]);

  const completedResponses = useMemo(() => {
    if (!testPlanRunAssertionsQueryResult?.testPlanRun) return 0;

    const { testPlanRun: tpr } = testPlanRunAssertionsQueryResult;
    const isRerun = !!tpr.isRerun;

    const isScenarioResultCompleted = scenarioResult =>
      typeof scenarioResult.output === 'string' && scenarioResult.output !== '';

    const isScenarioResultCompletedRerun = scenarioResult =>
      isScenarioResultCompleted(scenarioResult) &&
      scenarioResult.negativeSideEffects !== null &&
      scenarioResult.assertionResults.every(
        assertionResult => assertionResult.passed !== null
      );

    const getNumCompletedOutputs = result => {
      return result.scenarioResults.reduce((acc, scenario) => {
        if (isRerun) {
          return acc + (isScenarioResultCompletedRerun(scenario) ? 1 : 0);
        }
        return acc + (isScenarioResultCompleted(scenario) ? 1 : 0);
      }, 0);
    };

    return tpr.testResults.reduce(
      (acc, result) => acc + getNumCompletedOutputs(result),
      0
    );
  }, [testPlanRunAssertionsQueryResult]);

  if (pollInterval) {
    return {
      testResultsLength,
      totalPossibleAssertions,
      totalValidatedAssertions,
      completedResponses,
      refetch,
      stopPolling,
      startPolling
    };
  } else {
    return {
      testResultsLength,
      totalPossibleAssertions,
      totalValidatedAssertions,
      completedResponses,
      refetch
    };
  }
};
