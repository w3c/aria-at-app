import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';

const BasicModal = ({
    show = false,
    centered = false,
    animation = true,
    details = { title: '', description: '' },
    handleClose = () => {},
    handleAction = () => {}
}) => {
    return (
        <>
            <Modal
                show={show}
                centered={centered}
                animation={animation}
                onHide={handleClose}
                aria-labelledby="basic-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{details.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{details.description}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAction}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

BasicModal.propTypes = {
    show: PropTypes.bool,
    centered: PropTypes.bool,
    animation: PropTypes.bool,
    details: PropTypes.object,
    handleClose: PropTypes.func,
    handleAction: PropTypes.func
};

export default BasicModal;
