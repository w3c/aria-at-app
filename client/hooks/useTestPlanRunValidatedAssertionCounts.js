import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY } from '../components/TestQueueRunCompletionStatus/queries';

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
