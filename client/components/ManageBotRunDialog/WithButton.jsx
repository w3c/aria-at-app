import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import ManageBotRunDialog from '.';
import { useTestPlanRunIsFinished } from '../../hooks/useTestPlanRunIsFinished';

const ManageBotRunDialogWithButton = ({
  testPlanRun,
  testPlanReportId,
  runnableTestsLength,
  testers,
  onChange
}) => {
  const { runIsFinished } = useTestPlanRunIsFinished(testPlanRun.id);
  const [showDialog, setShowDialog] = useState(false);
  if (runIsFinished) {
    return null;
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={async () => {
          setShowDialog(true);
        }}
        className="mb-2"
      >
        Manage {testPlanRun?.tester?.username} Run
      </Button>
      <ManageBotRunDialog
        testPlanRun={testPlanRun}
        show={showDialog}
        setShow={setShowDialog}
        testers={testers}
        testPlanReportId={testPlanReportId}
        runnableTestsLength={runnableTestsLength}
        onChange={async () => {
          await onChange();
          setShowDialog(false);
        }}
      />
    </>
  );
};

ManageBotRunDialogWithButton.propTypes = {
  testPlanRun: PropTypes.object.isRequired,
  testPlanReportId: PropTypes.string.isRequired,
  runnableTestsLength: PropTypes.number.isRequired,
  testers: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

export default ManageBotRunDialogWithButton;
