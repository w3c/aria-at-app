import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY,
    TEST_RESULTS_QUERY
} from '../queries';
import { useQuery } from '@apollo/client';
import { isAssertionValidated } from '../../../utils/automation';

const BotTestCompletionStatus = ({ testPlanRun, id, runnableTestsLength }) => {
    const { data: testPlanRunAssertionsQueryResult } = useQuery(
        TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY,
        {
            variables: {
                testPlanRunId: testPlanRun.id
            },
            fetchPolicy: 'cache-and-network'
        }
    );

    const testResultsLengthQueryResult = useQuery(TEST_RESULTS_QUERY, {
        variables: {
            testPlanRunId: testPlanRun.id
        },
        fetchPolicy: 'cache-and-network',
        pollInterval: 500
    });

    const { stopPolling, startPolling } = testResultsLengthQueryResult;
    const testResultsLength = useMemo(() => {
        if (testResultsLengthQueryResult.data) {
            const length =
                testResultsLengthQueryResult.data.testPlanRun.testResults
                    .length;
            if (length === runnableTestsLength) {
                stopPolling();
            }
            return length;
        } else {
            return 0;
        }
    }, [
        testResultsLengthQueryResult.data,
        runnableTestsLength,
        stopPolling,
        startPolling
    ]);

    const totalPossibleAssertions = useMemo(() => {
        if (testPlanRunAssertionsQueryResult) {
            let count = 0;
            const {
                testPlanRun: { testResults }
            } = testPlanRunAssertionsQueryResult;
            for (let i = 0; i < testResults.length; i++) {
                const scenarios = testResults[i].scenarioResults;
                for (let j = 0; j < scenarios.length; j++) {
                    const assertions = scenarios[j].assertionResults;
                    for (let k = 0; k < assertions.length; k++) {
                        count++;
                    }
                }
            }
            return count;
        } else {
            return 0;
        }
    }, [testPlanRunAssertionsQueryResult]);

    const countNonNullAssertionsInScenario = scenario => {
        return scenario.assertionResults.reduce((acc, assertion) => {
            return acc + (isAssertionValidated(assertion) ? 1 : 0);
        }, 0);
    };

    const countNonNullAssertionsInTest = test => {
        return test.scenarioResults.reduce((acc, scenario) => {
            return acc + countNonNullAssertionsInScenario(scenario);
        }, 0);
    };

    const totalCompletedAssertions = useMemo(() => {
        if (!testPlanRunAssertionsQueryResult) {
            return 0;
        }

        const {
            testPlanRun: { testResults }
        } = testPlanRunAssertionsQueryResult;
        return testResults.reduce((acc, test) => {
            return acc + countNonNullAssertionsInTest(test);
        }, 0);
    }, [testPlanRunAssertionsQueryResult]);

    return (
        <ul id={id} className="text-secondary">
            <li>
                {`Responses for ${testResultsLength} of ${runnableTestsLength} tests recorded`}
            </li>
            <li>
                {`Verdicts for ${totalCompletedAssertions} of ${totalPossibleAssertions} assertions assigned`}
            </li>
        </ul>
    );
};

BotTestCompletionStatus.propTypes = {
    testPlanRun: PropTypes.shape({
        id: PropTypes.string.isRequired,
        testResults: PropTypes.arrayOf(
            PropTypes.shape({
                scenarioResults: PropTypes.arrayOf(
                    PropTypes.shape({
                        assertionResults: PropTypes.arrayOf(
                            PropTypes.shape({
                                passed: PropTypes.bool
                            })
                        )
                    })
                )
            })
        )
    }).isRequired,
    id: PropTypes.string.isRequired,
    runnableTestsLength: PropTypes.number.isRequired
};

export default BotTestCompletionStatus;
