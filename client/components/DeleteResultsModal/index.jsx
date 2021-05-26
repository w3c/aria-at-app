import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

class DeleteResultsModal extends Component {
    render() {
        const { show, handleClose, deleteResults, admin, user, run } =
            this.props;

        const deleteDetails = run
            ? `${run.apg_example_name} - ${run.at_name} ${run.at_version} ${run.browser_name} ${run.browser_version}`
            : '';
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
                                The following results for <b>{user}</b> will be
                                deleted:
                            </p>
                            <p>
                                <b>{deleteDetails}</b>
                            </p>
                            <p>
                                Please press <b>Delete</b> to confirm this
                                action.
                            </p>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <p>Your results will be deleted for:</p>
                            <p>
                                <b>{deleteDetails}</b>
                            </p>
                            <p>
                                Please press <b>Delete</b> to confirm this
                                action.
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
    run: PropTypes.object,
    show: PropTypes.bool,
    user: PropTypes.string,
};

export default DeleteResultsModal;
