import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Modal } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import formatConflictsAsText from '../../utils/formatConflictsAsText';
import nextId from 'react-id-generator';
import { getConflictsByTestResults } from '../../actions/cycles';

class ReviewConflictsModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isReady: false,
            conflictText: '',
            modalBody: ''
        };
    }

    async componentDidMount() {
        const { dispatch, test, testerId, usersById } = this.props;

        await dispatch(getConflictsByTestResults(test, testerId));

        const { conflicts } = this.props;

        const you = usersById[testerId].username;

        this.setState({
            isReady: true,
            conflictsText: formatConflictsAsText(conflicts, testerId),
            modalBody: conflicts.map((conflict, index) => {
                if (conflict.assertion) {
                    let yourAnswer = conflict.answers.find(
                        a => a.user === testerId
                    );
                    let otherAnswers = conflict.answers.filter(
                        a => a.user !== testerId
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
                                {otherAnswers.map(answer => {
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
                        a => a.user === testerId
                    );
                    let otherUnexpecteds = conflict.answers.filter(
                        a => a.user !== testerId
                    );
                    return (
                        <Fragment key={nextId()}>
                            <h5>{`Difference ${index +
                                1} - Unexpected behavior when testing command "${
                                conflict.command
                            }"`}</h5>
                            <ul>
                                <li>
                                    {`${you}'s result: ${yourUnexpecteds.answer} (for output "${yourUnexpecteds.output}")`}
                                </li>
                                {otherUnexpecteds.map(answer => {
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
            })
        });
    }

    render() {
        const { isReady } = this.state;
        const { show, onHide, handleRaiseIssueClick, conflicts } = this.props;

        if (!isReady) {
            return null;
        }
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
    conflicts: PropTypes.array,
    dispatch: PropTypes.func,
    onHide: PropTypes.func,
    handleRaiseIssueClick: PropTypes.func,
    show: PropTypes.bool,
    test: PropTypes.object,
    usersById: PropTypes.object,
    testerId: PropTypes.number
};

const mapStateToProps = (state, ownProps) => {
    const { conflictsByTestId } = state.cycles;
    const { usersById } = state.users;
    const conflicts = conflictsByTestId[ownProps.test.id] || [];
    return { conflicts, usersById };
};

export default connect(mapStateToProps)(ReviewConflictsModal);
