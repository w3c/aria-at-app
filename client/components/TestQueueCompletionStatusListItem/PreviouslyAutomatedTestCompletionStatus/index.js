import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import { TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY } from '../queries';
import { isAssertionValidated } from '../../../utils/automation';

const PreviouslyAutomatedTestCompletionStatus = ({
    runnableTestsLength,
    testPlanRunId,
    id
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

        const {
            testPlanRun: { testResults }
        } = testPlanRunAssertionsQueryResult;

        return testResults.reduce((acc, testResult) => {
            const isTestValidated = testResult.scenarioResults.every(
                scenarioResult =>
                    scenarioResult.assertionResults.every(isAssertionValidated)
            );

            return isTestValidated ? acc + 1 : acc;
        }, 0);
    }, [testPlanRunAssertionsQueryResult]);

    return (
        <div id={id} className="text-secondary">
            {`${numValidatedTests} of ${runnableTestsLength} tests evaluated`}
        </div>
    );
};

PreviouslyAutomatedTestCompletionStatus.propTypes = {
    runnableTestsLength: PropTypes.number.isRequired,
    testPlanRunId: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
};

export default PreviouslyAutomatedTestCompletionStatus;
