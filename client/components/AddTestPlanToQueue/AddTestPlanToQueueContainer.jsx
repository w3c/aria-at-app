import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const AddTestPlanToQueueContainer = ({ handleOpenDialog = () => {} }) => {
    return (
        <div className="add-test-plan-queue-container">
            <Button
                className="add-test-plan-queue-button"
                variant="primary"
                onClick={handleOpenDialog}
            >
                <FontAwesomeIcon icon={faPlus} />
                Add a Test Plan to the Queue
            </Button>
        </div>
    );
};

AddTestPlanToQueueContainer.propTypes = {
    handleOpenDialog: PropTypes.func
};

export default AddTestPlanToQueueContainer;
