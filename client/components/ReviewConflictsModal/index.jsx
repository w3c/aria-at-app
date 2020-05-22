import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import formatConflictsAsText from '../../utils/formatConflictsAsText';
import nextId from 'react-id-generator';


class ReviewConflictsModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            conflictText: '',
            modalBody: ''
        };
    }

    async componentDidMount() {
        const { conflicts, userId } = this.props;

        this.setState({
            conflictsText: formatConflictsAsText(conflicts, userId),
            modalBody: conflicts.map((conflict, index) => {
                if (conflict.assertion) {
                    let yourAnswer = conflict.answers.find(
                        a => a.user === userId
                    );
                    let otherAnswers = conflict.answers.filter(
                        a => a.user !== userId
                    );
                    return (
                        <Fragment key={nextId()}>
                            <h5>{`Difference ${index + 1} - Testing command "${
                                conflict.command
                            }" for assertion "${conflict.assertion}"`}</h5>
                            <ul>
                                <li>
                                    {`Your result: ${yourAnswer.answer} (for output "${yourAnswer.output}")`}
                                </li>
                                {otherAnswers.map(answer => {
                                    return (
                                        <li key={nextId()}>
                                            {`Other's result: ${answer.answer} (for output "${answer.output}")`}
                                        </li>
                                    );
                                })}
                            </ul>
                        </Fragment>
                    );
                } else {
                    let yourUnexpecteds = conflict.answers.find(
                        a => a.user === userId
                    );
                    let otherUnexpecteds = conflict.answers.filter(
                        a => a.user !== userId
                    );
                    return (
                        <Fragment key={nextId()}>
                            <h5>{`Difference ${index +
                                1} - Unexpected behavior when testing command "${
                                conflict.command
                            }"`}</h5>
                            <ul>
                                <li>
                                    {`Your result: ${yourUnexpecteds.answer} (for output "${yourUnexpecteds.output}")`}
                                </li>
                                {otherUnexpecteds.map(answer => {
                                    return (
                                        <li key={nextId()}>
                                            {`Other's result: ${answer.answer} (for output "${answer.output}")`}
                                        </li>
                                    );
                                })}
                            </ul>
                        </Fragment>
                    );
                }
            })
        });
    }

    render() {
        const { show, onHide, handleRaiseIssueClick, conflicts} = this.props;

        return (
            <Modal
                autoFocus
                keyboard
                scrollable
                dialogClassName="modal-xl"
                onHide={onHide}
                show={show}
                aria-labelledby="raise-issue-modal-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title
                        autoFocus
                        id="raise-issue-modal-title"
                        tabIndex={1}
                    >
                        {`Reviewing ${conflicts.length} Conflicts`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>{this.state.modalBody}</Modal.Body>
                <Modal.Footer>
                  <CopyToClipboard text={this.state.conflictsText}>
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
    onHide: PropTypes.func,
    handleRaiseIssueClick: PropTypes.func,
    show: PropTypes.bool,
    userId: PropTypes.number,
    conflicts: PropTypes.array
};

export default ReviewConflictsModal;
