import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import { TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY } from '../queries';

const PreviouslyAutomatedTestCompletionStatus = ({
    runnableTestsLength,
    testPlanRunId,
    id,
    fromTestQueueV2 = false // TODO: Remove when Test Queue v1 is removed
}) => {
    const { data: testPlanRunAssertionsQueryResult } = useQuery(
        TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY,
        {
            variables: {
                testPlanRunId: testPlanRunId
            },
            fetchPolicy: 'cache-and-network'
        }
    );

    const numValidatedTests = useMemo(() => {
        if (!testPlanRunAssertionsQueryResult) {
            return 0;
        }

        const { testPlanRun } = testPlanRunAssertionsQueryResult;

        if (!testPlanRun) {
            return 0;
        }

        const { testResults = [] } = testPlanRun;

        return testResults.reduce(
            (acc, { completedAt }) => acc + (completedAt ? 1 : 0),
            0
        );
    }, [testPlanRunAssertionsQueryResult]);

    return (
        <>
            {fromTestQueueV2 ? (
                <em id={id}>
                    {`${numValidatedTests} of ${runnableTestsLength} tests evaluated`}
                </em>
            ) : (
                <div id={id} className="text-secondary">
                    {`${numValidatedTests} of ${runnableTestsLength} tests evaluated`}
                </div>
            )}
        </>
    );
};

PreviouslyAutomatedTestCompletionStatus.propTypes = {
    runnableTestsLength: PropTypes.number.isRequired,
    testPlanRunId: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    fromTestQueueV2: PropTypes.bool
};

export default PreviouslyAutomatedTestCompletionStatus;
