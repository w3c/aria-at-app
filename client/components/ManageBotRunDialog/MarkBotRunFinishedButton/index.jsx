import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';
import {
  SUBMIT_TEST_RESULT_MUTATION,
  TEST_PLAN_RUN_RESULT_IDS
} from './queries';
import { LoadingStatus, useTriggerLoad } from '../../common/LoadingStatus';
import { useTestPlanRunValidatedAssertionCounts } from '../../../hooks/useTestPlanRunValidatedAssertionCounts';
import BasicModal from '../../common/BasicModal';
import { useTestPlanRunIsFinished } from '../../../hooks/useTestPlanRunIsFinished';

const MarkBotRunFinishedButton = ({ testPlanRun, onClick = () => {} }) => {
  const {
    data: testPlanRunCompletionQuery,
    loading,
    refetch
  } = useQuery(TEST_PLAN_RUN_RESULT_IDS, {
    variables: {
      testPlanRunId: testPlanRun.id
    }
  });

  const { triggerLoad, loadingMessage } = useTriggerLoad();

  const { totalValidatedAssertions, totalPossibleAssertions } =
    useTestPlanRunValidatedAssertionCounts(testPlanRun);

  const [submitTestResult] = useMutation(SUBMIT_TEST_RESULT_MUTATION);

  const [showConfirmation, setShowConfirmation] = useState(false);

  const { runIsFinished } = useTestPlanRunIsFinished(testPlanRun.id);

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

  const buttonDisabled =
    totalPossibleAssertions === 0 ||
    totalValidatedAssertions < totalPossibleAssertions ||
    runIsFinished;

  return (
    <LoadingStatus message={loadingMessage}>
      <BasicModal
        title={`Are you sure you wish to mark ${testPlanRun.tester.username} run as finished?`}
        cancelButton={true}
        handleClose={() => setShowConfirmation(false)}
        handleHide={() => setShowConfirmation(false)}
        useOnHide={true}
        closeLabel="No"
        show={showConfirmation}
        actions={[
          {
            label: 'Yes',
            onClick: handleClick
          }
        ]}
      />
      <Button
        variant="secondary"
        onClick={() => setShowConfirmation(true)}
        disabled={buttonDisabled}
      >
        Mark as finished
      </Button>
    </LoadingStatus>
  );
};

MarkBotRunFinishedButton.propTypes = {
  testPlanRun: PropTypes.object.isRequired,
  onClick: PropTypes.func
};

export default MarkBotRunFinishedButton;
