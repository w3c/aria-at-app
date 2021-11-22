import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import ConflictingTestResults from '../../ConflictingTestReports';

const ReviewConflictsModal = ({
    testPlanReport,
    test,
    show = false,
    handleClose = () => {},
    issueLink
}) => {
    const copyMarkdownToClipboardRef = useRef();

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
                <ConflictingTestResults
                    testPlanReportId={testPlanReport.id}
                    testId={test.id}
                    copyMarkdownToClipboardRef={copyMarkdownToClipboardRef}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={() => copyMarkdownToClipboardRef.current()}
                >
                    Copy Conflicts to Clipboard
                </Button>
                <Button variant="secondary" target="_blank" href={issueLink}>
                    Raise an Issue for Conflict
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

ReviewConflictsModal.propTypes = {
    show: PropTypes.bool,
    testPlanReport: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    }).isRequired,
    test: PropTypes.shape({
        id: PropTypes.string.isRequired
    }).isRequired,
    handleClose: PropTypes.func,
    issueLink: PropTypes.string
};

export default ReviewConflictsModal;
