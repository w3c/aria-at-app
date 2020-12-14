import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

class DeleteResultsModal extends Component {
    render() {
        const { show, handleClose, deleteResults, admin, user } = this.props;
        return (
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {admin
                            ? `You are about to delete results for ${user}`
                            : 'You are about to delete your results'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {admin ? (
                        <React.Fragment>
                            <p>
                                Results for {user} will be deleted. Please press{' '}
                                <b>Delete</b> to confirm this action.
                            </p>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <p>
                                Your results will be deleted. Please press{' '}
                                <b>Delete</b> to confirm this action.
                            </p>
                        </React.Fragment>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={deleteResults}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

DeleteResultsModal.propTypes = {
    admin: PropTypes.bool,
    deleteResults: PropTypes.func,
    handleClose: PropTypes.func,
    show: PropTypes.bool,
    user: PropTypes.string
};

export default DeleteResultsModal;
