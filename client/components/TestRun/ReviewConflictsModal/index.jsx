import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';

const ReviewConflictsModal = ({
    show = false,
    conflictsFormatted = '',
    handleClose = () => {},
    handleRaiseIssueButtonClick = () => {}
}) => {
    return (
        <Modal
            show={show}
            role="dialog"
            tabIndex={-1}
            keyboard
            scrollable
            dialogClassName="modal-xl"
            aria-modal="true"
            aria-labelledby="review-conflicts-modal"
            onHide={handleClose}
        >
            <Modal.Header closeButton>
                <Modal.Title id="review-conflicts-modal-title">
                    Reviewing Conflicts
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Fragment>
                    <ReactMarkdown>{conflictsFormatted}</ReactMarkdown>
                </Fragment>
            </Modal.Body>
            <Modal.Footer>
                <CopyToClipboard text={conflictsFormatted}>
                    <Button variant="secondary">
                        Copy Conflicts to Clipboard
                    </Button>
                </CopyToClipboard>
                <Button
                    variant="secondary"
                    onClick={handleRaiseIssueButtonClick}
                >
                    Raise an Issue for Conflict
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

ReviewConflictsModal.propTypes = {
    show: PropTypes.bool,
    conflictsFormatted: PropTypes.string,
    handleClose: PropTypes.func,
    handleRaiseIssueButtonClick: PropTypes.func
};

export default ReviewConflictsModal;
