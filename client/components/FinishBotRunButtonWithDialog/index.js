import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import FinishBotRunDialog from './FinishBotRunDialog';

const FinishBotRunButtonWithDialog = ({ testPlanRun }) => {
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
            />
        </>
    );
};

FinishBotRunButtonWithDialog.propTypes = {
    testPlanRun: PropTypes.object.isRequired
};

export default FinishBotRunButtonWithDialog;
