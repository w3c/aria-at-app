import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

const DeleteTestPlanModal = ({
    show = false,
    details = {
        title: 'Title N/A'
    },
    handleClose = () => {},
    handleAction = () => {}
}) => {
    const { title } = details;

    return (
        <Modal
            show={show}
            onHide={handleClose}
            aria-labelledby="delete-test-plan-report-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {`You are about the delete the Test Plan Report for ${title}`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <>
                    <p>The following Test Plan Report will be deleted:</p>
                    <p>
                        <b>{title}</b>
                    </p>
                    <p>
                        Please press <b>Delete</b> to confirm this action.
                    </p>
                </>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleAction}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

DeleteTestPlanModal.propTypes = {
    show: PropTypes.bool,
    details: PropTypes.object,
    handleClose: PropTypes.func,
    handleAction: PropTypes.func
};

export default DeleteTestPlanModal;
