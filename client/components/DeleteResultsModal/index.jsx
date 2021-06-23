import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

const DeleteResultsModal = ({
    show = false,
    isAdmin = false,
    title = 'Title N/A',
    username = null,
    handleClose = () => {},
    handleDeleteResults = () => {}
}) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isAdmin
                        ? `You are about to delete results for ${username}`
                        : 'You are about to delete your results'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isAdmin ? (
                    <React.Fragment>
                        <p>
                            The following results for <b>{username}</b> will be
                            deleted:
                        </p>
                        <p>
                            <b>{title}</b>
                        </p>
                        <p>
                            Please press <b>Delete</b> to confirm this action.
                        </p>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <p>Your results will be deleted for:</p>
                        <p>
                            <b>{title}</b>
                        </p>
                        <p>
                            Please press <b>Delete</b> to confirm this action.
                        </p>
                    </React.Fragment>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteResults}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

DeleteResultsModal.propTypes = {
    show: PropTypes.bool,
    username: PropTypes.string,
    handleClose: PropTypes.func,
    handleDeleteResults: PropTypes.func,
    isAdmin: PropTypes.bool,
    title: PropTypes.string
};

export default DeleteResultsModal;
