import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY } from '../components/TestQueueCompletionStatusListItem/queries';

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
    if (testPlanRunAssertionsQueryResult) {
      let count = 0;
      if (!testPlanRunAssertionsQueryResult?.testPlanRun) {
        return 0;
      }
      const {
        testPlanRun: { testResults }
      } = testPlanRunAssertionsQueryResult;
      for (let i = 0; i < testResults.length; i++) {
        const scenarios = testResults[i].scenarioResults;
        for (let j = 0; j < scenarios.length; j++) {
          const assertions = scenarios[j].assertionResults;
          count += assertions.length;
        }
      }
      return count;
    } else {
      return 0;
    }
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
        (test.completedAt
          ? test.scenarioResults.reduce((acc, scenario) => {
              return acc + scenario.assertionResults.length;
            }, 0)
          : 0)
      );
    }, 0);
  }, [testPlanRunAssertionsQueryResult]);
  if (pollInterval) {
    return {
      testResultsLength,
      totalPossibleAssertions,
      totalValidatedAssertions,
      refetch,
      stopPolling,
      startPolling
    };
  } else {
    return {
      testResultsLength,
      totalPossibleAssertions,
      totalValidatedAssertions,
      refetch
    };
  }
};
