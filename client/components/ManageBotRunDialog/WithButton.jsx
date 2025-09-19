import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import ManageBotRunDialog from '.';
import { TestPlanRunPropType, UserPropType } from '../common/proptypes';

const ManageBotRunDialogWithButton = ({
  testPlanRun,
  testPlanReportId,
  runnableTestsLength,
  testers,
  onChange,
  me
}) => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        onClick={async () => {
          setShowDialog(true);
        }}
      >
        <FontAwesomeIcon icon={faRobot} />
        Manage {testPlanRun?.tester?.username} Run
      </Button>
      {showDialog ? (
        <ManageBotRunDialog
          testPlanRun={testPlanRun}
          show={showDialog}
          setShow={setShowDialog}
          testers={testers}
          me={me}
          testPlanReportId={testPlanReportId}
          runnableTestsLength={runnableTestsLength}
          onChange={async () => {
            await onChange();
            setShowDialog(false);
          }}
        />
      ) : null}
    </>
  );
};

ManageBotRunDialogWithButton.propTypes = {
  testPlanRun: TestPlanRunPropType.isRequired,
  testPlanReportId: PropTypes.string.isRequired,
  runnableTestsLength: PropTypes.number.isRequired,
  testers: PropTypes.arrayOf(UserPropType).isRequired,
  onChange: PropTypes.func.isRequired,
  me: UserPropType
};

export default ManageBotRunDialogWithButton;
