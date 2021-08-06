import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import formatConflictsAsText from '../../../utils/formatConflictsAsText';
import nextId from 'react-id-generator';

const ReviewConflictsModal = ({
    show = false,
    testerId,
    conflicts = [],
    handleClose = () => {},
    handleRaiseIssueButtonClick = () => {}
}) => {
    const renderModalBody = () => {
        return conflicts.map((conflict, index) => {
            if (conflict.assertion) {
                let currentUsername = '';
                let yourAnswer = conflict.answers.find(a => {
                    if (a.tester.id == testerId) {
                        currentUsername = a.tester.username;
                        return true;
                    }
                });
                let otherAnswers = conflict.answers.filter(
                    a => a.tester.id != testerId
                );

                return (
                    <Fragment key={nextId()}>
                        <h5>{`Difference ${index + 1} - Testing command "${
                            conflict.command
                        }" for assertion "${conflict.assertion}"`}</h5>
                        <ul>
                            <li>
                                {`${currentUsername}'s result: ${yourAnswer.answer} (for output "${yourAnswer.output}")`}
                            </li>
                            {otherAnswers.map(answer => {
                                let other = answer.tester.username;
                                return (
                                    <li key={nextId()}>
                                        {`${other}'s result: ${answer.answer} (for output "${answer.output}")`}
                                    </li>
                                );
                            })}
                        </ul>
                    </Fragment>
                );
            } else {
                let currentUsername = '';
                let yourUnexpecteds = conflict.answers.find(a => {
                    if (a.tester.id == testerId) {
                        currentUsername = a.tester.username;
                        return true;
                    }
                });
                let otherUnexpecteds = conflict.answers.filter(
                    a => a.tester.id != testerId
                );
                return (
                    <Fragment key={nextId()}>
                        <h5>{`Difference ${index +
                            1} - Unexpected behavior when testing command "${
                            conflict.command
                        }"`}</h5>
                        <ul>
                            <li>
                                {`${currentUsername}'s result: ${yourUnexpecteds.answer} (for output "${yourUnexpecteds.output}")`}
                            </li>
                            {otherUnexpecteds.map(answer => {
                                let other = answer.tester.username;
                                return (
                                    <li key={nextId()}>
                                        {`${other}'s result: ${answer.answer} (for output "${answer.output}")`}
                                    </li>
                                );
                            })}
                        </ul>
                    </Fragment>
                );
            }
        });
    };

    const conflictsText = formatConflictsAsText(conflicts, testerId);
    const modalBody = renderModalBody(conflicts);

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
                    {`Reviewing ${conflicts.length} Conflicts`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalBody}</Modal.Body>
            <Modal.Footer>
                <CopyToClipboard text={conflictsText}>
                    <Button variant="secondary">
                        Copy Conflicts to Clipboard
                    </Button>
                </CopyToClipboard>
                <Button
                    variant="secondary"
                    onClick={handleRaiseIssueButtonClick}
                >
                    Raise an Issue for this Conflict
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

ReviewConflictsModal.propTypes = {
    show: PropTypes.bool,
    testerId: PropTypes.any,
    conflicts: PropTypes.array,
    handleClose: PropTypes.func,
    handleRaiseIssueButtonClick: PropTypes.func
};

export default ReviewConflictsModal;
