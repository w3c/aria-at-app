import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const TestPlanUpdaterModal = ({ show, handleClose }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body>Woohoo, youre reading this text in a modal!</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

TestPlanUpdaterModal.propTypes = {
    show: PropTypes.bool,
    isAdmin: PropTypes.bool,
    details: PropTypes.object,
    handleClose: PropTypes.func,
    handleAction: PropTypes.func
};

export default TestPlanUpdaterModal;
