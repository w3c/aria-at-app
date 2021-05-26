import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Modal } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import checkForConflict from '../../utils/checkForConflict';
import formatConflictsAsText from '../../utils/formatConflictsAsText';
import nextId from 'react-id-generator';

class ReviewConflictsModal extends Component {
    constructor(props) {
        super(props);
    }
    renderModalBody(conflicts) {
        const { testerId, usersById } = this.props;

        const you = usersById[testerId].username;
        return conflicts.map((conflict, index) => {
            if (conflict.assertion) {
                let yourAnswer = conflict.answers.find(
                    (a) => a.user === testerId
                );
                let otherAnswers = conflict.answers.filter(
                    (a) => a.user !== testerId
                );
                return (
                    <Fragment key={nextId()}>
                        <h5>{`Difference ${index + 1} - Testing command "${
                            conflict.command
                        }" for assertion "${conflict.assertion}"`}</h5>
                        <ul>
                            <li>
                                {`${you}'s result: ${yourAnswer.answer} (for output "${yourAnswer.output}")`}
                            </li>
                            {otherAnswers.map((answer) => {
                                let other = usersById[answer.user].username;
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
                let yourUnexpecteds = conflict.answers.find(
                    (a) => a.user === testerId
                );
                let otherUnexpecteds = conflict.answers.filter(
                    (a) => a.user !== testerId
                );
                return (
                    <Fragment key={nextId()}>
                        <h5>{`Difference ${
                            index + 1
                        } - Unexpected behavior when testing command "${
                            conflict.command
                        }"`}</h5>
                        <ul>
                            <li>
                                {`${you}'s result: ${yourUnexpecteds.answer} (for output "${yourUnexpecteds.output}")`}
                            </li>
                            {otherUnexpecteds.map((answer) => {
                                let other = usersById[answer.user].username;
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
    }

    render() {
        const { show, onHide, handleRaiseIssueClick, test, testerId } =
            this.props;

        if (!test.results) {
            return null;
        }

        const conflicts = checkForConflict(test.results, testerId);

        if (conflicts.length === 0) {
            return null;
        }

        const conflictsText = formatConflictsAsText(conflicts, testerId);
        const modalBody = this.renderModalBody(conflicts);

        const role = 'dialog';
        return (
            <Modal
                aria-labelledby="review-conflicts-modal-title"
                aria-modal="true"
                keyboard
                scrollable
                dialogClassName="modal-xl"
                onHide={onHide}
                role={role}
                show={show}
                tabIndex={-1}
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
                    <Button variant="secondary" onClick={handleRaiseIssueClick}>
                        Raise an Issue for this Conflict
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

ReviewConflictsModal.propTypes = {
    conflicts: PropTypes.array,
    dispatch: PropTypes.func,
    onHide: PropTypes.func,
    handleRaiseIssueClick: PropTypes.func,
    show: PropTypes.bool,
    test: PropTypes.object,
    usersById: PropTypes.object,
    testerId: PropTypes.number,
};

const mapStateToProps = (state) => {
    const { usersById } = state.users;
    return { usersById };
};

export default connect(mapStateToProps)(ReviewConflictsModal);
