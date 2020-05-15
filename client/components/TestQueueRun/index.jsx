import React, { Component } from 'react';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteUsersFromRun, saveUsersToRuns } from '../../actions/cycles';

class TestQueueRow extends Component {
    constructor(props) {
        super(props);
        this.handleUnassignClick = this.handleUnassignClick.bind(this);
        this.handleAssignClick = this.handleAssignClick.bind(this);
    }

    handleUnassignClick() {
        const { dispatch, cycleId, userId, runId } = this.props;
        dispatch(deleteUsersFromRun([userId], runId, cycleId));
    }

    handleAssignClick() {
        const { dispatch, cycleId, userId, runId } = this.props;
        dispatch(saveUsersToRuns([userId], [runId], cycleId));
    }

    renderTestsCompletedByUser(uid) {
        const { testsForRun, usersById } = this.props;

        let totalTests = testsForRun.length;
        let testsCompleted = testsForRun.filter(
            t =>
                t.results &&
                t.results[uid] &&
                t.results[uid].status === 'complete'
        ).length;

        return (
            <div
                key={nextId()}
            >{`${usersById[uid].username} ${testsCompleted} of ${totalTests} tests complete`}</div>
        );
    }

    render() {
        const {
            cycleId,
            userId,
            runId,
            testers,
            apgExampleName,
            atName,
            browserName
        } = this.props;
        let currentUserAssigned = testers.includes(userId);

        let designPatternLinkOrName;
        if (currentUserAssigned) {
            designPatternLinkOrName = (
                <Link to={`/cycles/${cycleId}/run/${runId}`}>
                    {apgExampleName}
                </Link>
            );
        } else {
            designPatternLinkOrName = apgExampleName;
        }

        let testrun = `${apgExampleName} for ${atName} on ${browserName}`;
        let assignOrUnassignButton;
        if (currentUserAssigned) {
            assignOrUnassignButton = (
                <Button
                    onClick={this.handleUnassignClick}
                    aria-label={`Unassign me from the test run ${testrun}`}
                >
                    Unassign Me
                </Button>
            );
        } else if (testers.length < 2) {
            assignOrUnassignButton = (
                <Button
                    onClick={this.handleAssignClick}
                    aria-label={`Assign me to the test run ${testrun}`}
                >
                    Assign Me
                </Button>
            );
        }

        let userInfo = testers
            .filter(uid => uid !== userId)
            .map(uid => this.renderTestsCompletedByUser(uid));

        if (currentUserAssigned) {
            userInfo.unshift(this.renderTestsCompletedByUser(userId));
        }

        let status = 'Not started';
        if (userInfo.length) {
            status = 'In Progress';
        }

        return (
            <tr key={runId}>
                <td>{designPatternLinkOrName}</td>
                <td>
                    {userInfo.length !== 0 ? userInfo : 'No testers assigned'}
                </td>
                <td>{status}</td>
                <td>{assignOrUnassignButton}</td>
            </tr>
        );
    }
}

TestQueueRow.propTypes = {
    cycleId: PropTypes.number,
    runId: PropTypes.number,
    apgExampleName: PropTypes.string,
    testers: PropTypes.array,
    usersById: PropTypes.object,
    userId: PropTypes.number,
    atName: PropTypes.string,
    browserName: PropTypes.string,
    dispatch: PropTypes.func,
    testsForRun: PropTypes.array
};

export default connect()(TestQueueRow);
