import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import ConflictingTestResults from '../../ConflictingTestReports';

const ReviewConflictsModal = ({
    testPlanVersion,
    testPlanReport,
    test,
    issueLink,
    conflictMarkdown,
    show = false,
    handleClose = () => {}
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
                <ConflictingTestResults
                    testPlanVersion={testPlanVersion}
                    testPlanReport={testPlanReport}
                    test={test}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={() =>
                        navigator.clipboard.writeText(conflictMarkdown)
                    }
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
    testPlanVersion: PropTypes.object.isRequired,
    testPlanReport: PropTypes.object.isRequired,
    test: PropTypes.object.isRequired,
    handleClose: PropTypes.func,
    conflictMarkdown: PropTypes.string,
    issueLink: PropTypes.string.isRequired
};

export default ReviewConflictsModal;
