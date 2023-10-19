import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';
import {
    SUBMIT_TEST_RESULT_MUTATION,
    TEST_PLAN_RUN_TEST_RESULTS_COMPLETION_STATUS
} from './queries';
import { useTriggerLoad } from '../../common/LoadingStatus';
import { useTestPlanRunValidatedAssertionCounts } from '../../../hooks/useTestPlanRunValidatedAssertionCounts';

const MarkBotRunFinishedButton = ({ testPlanRun, onClick = () => {} }) => {
    const {
        data: testPlanRunCompletionQuery,
        loading,
        refetch
    } = useQuery(TEST_PLAN_RUN_TEST_RESULTS_COMPLETION_STATUS, {
        variables: {
            testPlanRunId: testPlanRun.id
        }
    });

    const { triggerLoad } = useTriggerLoad();

    const { totalValidatedAssertions, totalPossibleAssertions } =
        useTestPlanRunValidatedAssertionCounts(testPlanRun);

    const runIsFinished = useMemo(() => {
        if (!testPlanRunCompletionQuery) {
            return false;
        }

        return testPlanRunCompletionQuery.testPlanRun.testResults.every(
            testResult => testResult.completedAt !== null
        );
    }, [testPlanRun, testPlanRunCompletionQuery]);

    const [submitTestResult] = useMutation(SUBMIT_TEST_RESULT_MUTATION);

    if (loading || !testPlanRunCompletionQuery) {
        return null;
    }

    const handleClick = async () => {
        await triggerLoad(async () => {
            for (const testResult of testPlanRunCompletionQuery.testPlanRun
                .testResults) {
                await submitTestResult({
                    variables: {
                        id: testResult.id
                    }
                });
            }
        }, 'Marking test plan run as finished');
        await refetch();
        await onClick();
    };

    return (
        <Button
            variant="secondary"
            onClick={handleClick}
            disabled={totalValidatedAssertions < totalPossibleAssertions}
        >
            {runIsFinished ? 'Mark as unfinished' : 'Mark as finished'}
        </Button>
    );
};

MarkBotRunFinishedButton.propTypes = {
    testPlanRun: PropTypes.object.isRequired,
    onClick: PropTypes.func
};

export default MarkBotRunFinishedButton;
