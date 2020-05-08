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

    render() {
        const {
            cycleId,
            userId,
            usersById,
            runId,
            testers,
            apgExampleName,
            atName,
            browserName,
            testsForRun
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

        let totalTests = testsForRun.length;
        let testsCompleted = testsForRun.filter(
            t => t.result && t.result.status === 'complete'
        ).length;

        let userInfo = testers
            .filter(uid => uid !== userId)
            .map(uid => (
                <div key={nextId()}>{`${usersById[uid].fullname} 0/${totalTests} complete`}</div>
            ));
        if (currentUserAssigned) {
            userInfo.unshift(
                <div key={nextId()}>{`${usersById[userId].fullname} ${testsCompleted}/${totalTests} complete `}</div>
            );
        }

        let status = 'Not started';
        if (currentUserAssigned && testsCompleted > 0) {
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
