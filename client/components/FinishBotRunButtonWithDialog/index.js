import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import FinishBotRunDialog from './FinishBotRunDialog';

const FinishBotRunButtonWithDialog = ({
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
                Finish Bot Run
            </Button>
            <FinishBotRunDialog
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

FinishBotRunButtonWithDialog.propTypes = {
    testPlanRun: PropTypes.object.isRequired,
    testPlanReportId: PropTypes.string.isRequired,
    testers: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
};

export default FinishBotRunButtonWithDialog;
