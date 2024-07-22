import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

const DeleteResultsModal = ({
  show = false,
  isAdmin = false,
  details = {
    title: 'Title N/A',
    username: null
  },
  handleClose = () => {},
  handleAction = () => {}
}) => {
  const { title, username } = details;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      aria-labelledby="delete-results-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {isAdmin
            ? `You are about to delete results for ${username}`
            : 'You are about to delete your results'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isAdmin ? (
          <>
            <p>
              The following results for <b>{username}</b> will be deleted:
            </p>
            <p>
              <b>{title}</b>
            </p>
            <p>
              Please press <b>Delete</b> to confirm this action.
            </p>
          </>
        ) : (
          <>
            <p>Your results will be deleted for:</p>
            <p>
              <b>{title}</b>
            </p>
            <p>
              Please press <b>Delete</b> to confirm this action.
            </p>
          </>
        )}
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

DeleteResultsModal.propTypes = {
  show: PropTypes.bool,
  isAdmin: PropTypes.bool,
  details: PropTypes.object,
  handleClose: PropTypes.func,
  handleAction: PropTypes.func
};

export default DeleteResultsModal;
