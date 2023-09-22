import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    ALL_ASSERTIONS_FOR_TEST_PLAN_VERSION_QUERY,
    TEST_PLAN_RUN_ASSERTION_RESULTS_QUERY
} from '../queries';
import { useQuery } from '@apollo/client';

const BotTestCompletionStatus = ({
    testPlanRunId,
    testPlanVersionId,
    id,
    testResultsLength,
    runnableTestsLength
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

    const testPlanVersionAssertionQueryResult = useQuery(
        ALL_ASSERTIONS_FOR_TEST_PLAN_VERSION_QUERY,
        {
            variables: {
                testPlanVersionId: testPlanVersionId
            },
            fetchPolicy: 'cache-and-network'
        }
    );

    const totalPossibleAssertions = useMemo(() => {
        if (testPlanVersionAssertionQueryResult.data) {
            return testPlanVersionAssertionQueryResult.data.testPlanVersion.tests.reduce(
                (acc, test) => {
                    return acc + test.assertions.length;
                },
                0
            );
        } else {
            return 0;
        }
    }, [testPlanVersionAssertionQueryResult.data]);

    const totalCompletedAssertions = useMemo(() => {
        if (testPlanRunAssertionsQueryResult) {
            const { testPlanRun } = testPlanRunAssertionsQueryResult;
            return testPlanRun?.testResults.reduce((acc, test) => {
                return (
                    acc +
                    test.scenarioResults.reduce((acc, scenario) => {
                        return (
                            acc +
                            scenario.assertionResults.reduce(
                                (acc, assertion) => {
                                    return acc + (assertion.passed ? 1 : 0);
                                },
                                0
                            )
                        );
                    }, 0)
                );
            }, 0);
        } else {
            return 0;
        }
    }, [testPlanRunAssertionsQueryResult]);

    return (
        <ul id={id}>
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
    testPlanRunId: PropTypes.string.isRequired,
    testPlanVersionId: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    testResultsLength: PropTypes.number.isRequired,
    runnableTestsLength: PropTypes.number.isRequired
};

export default BotTestCompletionStatus;
