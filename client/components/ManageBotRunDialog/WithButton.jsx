import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import ManageBotRunDialog from '.';

const ManageBotRunDialogWithButton = ({
    testPlanRun,
    testPlanReportId,
    testers,
    onChange
}) => {
    const [showDialog, setShowDialog] = useState(false);

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
    testers: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
};

export default ManageBotRunDialogWithButton;
