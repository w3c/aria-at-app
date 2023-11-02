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
export const useTestPlanRunIsFinished = testPlanRunId => {
    const { data: testPlanRunCompletionQuery } = useQuery(
        TEST_PLAN_RUN_TEST_RESULTS_COMPLETION_STATUS,
        {
            variables: {
                testPlanRunId
            },
            fetchPolicy: 'cache-and-network'
        }
    );

    const runIsFinished = useMemo(() => {
        if (!testPlanRunCompletionQuery) {
            return false;
        }

        return testPlanRunCompletionQuery.testPlanRun?.testResults.every(
            testResult => testResult.completedAt !== null
        );
    }, [testPlanRunId, testPlanRunCompletionQuery]);

    return { runIsFinished };
};
