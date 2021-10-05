import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MarkdownRenderer from 'react-markdown-renderer';

const ReviewConflictsModal = ({
    show = false,
    conflictsFormatted = '',
    handleClose = () => {},
    issueLink
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
                    <MarkdownRenderer markdown={conflictsFormatted} />
                </Fragment>
            </Modal.Body>
            <Modal.Footer>
                <CopyToClipboard text={conflictsFormatted}>
                    <Button variant="secondary">
                        Copy Conflicts to Clipboard
                    </Button>
                </CopyToClipboard>
                <Button variant="secondary" target="_blank" href={issueLink}>
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
    issueLink: PropTypes.string
};

export default ReviewConflictsModal;
