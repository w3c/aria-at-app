import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const NewTestPlanReportContainer = ({
    handleOpenDialog = () => {},
    openDialogTriggerId
}) => {
    return (
        <div className="add-test-plan-queue-container">
            <Button
                id={openDialogTriggerId}
                className="add-test-plan-queue-button"
                variant="primary"
                onClick={handleOpenDialog}
                data-testid="test-queue-add-test-plan-to-queue-button"
            >
                <FontAwesomeIcon icon={faPlus} />
                Add a Test Plan to the Queue
            </Button>
        </div>
    );
};

NewTestPlanReportContainer.propTypes = {
    handleOpenDialog: PropTypes.func,
    openDialogTriggerId: PropTypes.string
};

export default NewTestPlanReportContainer;
