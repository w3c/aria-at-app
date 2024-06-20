import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import ManageBotRunDialog from '.';
import { useTestPlanRunIsFinished } from '../../hooks/useTestPlanRunIsFinished';

const ManageBotRunDialogWithButton = ({
    testPlanRun,
    testPlanReportId,
    runnableTestsLength,
    testers,
    includeIcon = false,
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
            >
                {/* TODO: Include by default after removing Test Queue v1 content */}
                {includeIcon ? <FontAwesomeIcon icon={faRobot} /> : null}
                Manage {testPlanRun?.tester?.username} Run
            </Button>
            {showDialog ? (
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
            ) : null}
        </>
    );
};

ManageBotRunDialogWithButton.propTypes = {
    testPlanRun: PropTypes.object.isRequired,
    testPlanReportId: PropTypes.string.isRequired,
    runnableTestsLength: PropTypes.number.isRequired,
    testers: PropTypes.array.isRequired,
    includeIcon: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};

export default ManageBotRunDialogWithButton;
