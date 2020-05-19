import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import { Button, Dropdown } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteUsersFromRun, saveUsersToRuns } from '../../actions/cycles';

class TestQueueRow extends Component {
    constructor(props) {
        super(props);

        this.handleUnassignSelfClick = this.handleUnassignSelfClick.bind(this);
        this.handleAssignSelfClick = this.handleAssignSelfClick.bind(this);
        this.assignTesterSelect = this.assignTesterSelect.bind(this);
        this.unassignTesterSelect = this.unassignTesterSelect.bind(this);

        this.testerList = React.createRef();
    }

    handleUnassignSelfClick() {
        const { dispatch, cycleId, userId, runId } = this.props;
        dispatch(deleteUsersFromRun([userId], runId, cycleId));
    }

    handleAssignSelfClick() {
        const { dispatch, cycleId, userId, runId } = this.props;
        dispatch(saveUsersToRuns([userId], [runId], cycleId));
    }

    assignTesterSelect(event) {
        const { dispatch, cycleId, runId } = this.props;
        let uid = parseInt(event.target.value);
        dispatch(saveUsersToRuns([uid], [runId], cycleId));
    }

    unassignTesterSelect(event) {
        const { dispatch, cycleId, runId } = this.props;
        let uid = parseInt(event.target.value);
        dispatch(deleteUsersFromRun([uid], runId, cycleId));
    }

    componentDidUpdate(prevProps) {
        // Focus on the user list after editing the user list
        if (this.props.testers.length !== prevProps.testers.length) {
            this.testerList.current.focus();
        }
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
            <li
                key={nextId()}
            >{`${usersById[uid].username} ${testsCompleted} of ${totalTests} tests complete`}</li>
        );
    }

    renderAssignDropdowns() {
        const {
            apgExampleName,
            atName,
            atNameId,
            browserName,
            testers,
            usersById
        } = this.props;

        let testrun = `${apgExampleName} for ${atName} on ${browserName}`;

        let canUnassignTesters = [];
        let canAssignTesters = [];
        for (let uid of Object.keys(usersById)) {
            const tester = usersById[uid];

            if (testers.includes(tester.id)) {
                canUnassignTesters.push(tester);
            } else if (
                tester.configured_ats.find(ua => ua.at_name_id === atNameId)
            ) {
                canAssignTesters.push(tester);
            }
        }
        return (
            <Fragment>
                <Dropdown>
                    <Dropdown.Toggle
                        id={nextId()}
                        aria-label={`Assign Testers to ${testrun}`}
                        disabled={canAssignTesters.length ? false : true}
                    >
                        Assign Testers
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {canAssignTesters.map(t => {
                            return (
                                <Dropdown.Item
                                    as="button"
                                    key={nextId()}
                                    value={t.id}
                                    onClick={this.assignTesterSelect}
                                >
                                    {t.username}
                                </Dropdown.Item>
                            );
                        })}
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown>
                    <Dropdown.Toggle
                        id={nextId()}
                        aria-label={`Unassign Testers from ${testrun}`}
                        disabled={canUnassignTesters.length ? false : true}
                    >
                        Unassign Testers
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {canUnassignTesters.map(t => {
                            return (
                                <Dropdown.Item
                                    as="button"
                                    key={nextId()}
                                    value={t.id}
                                    onClick={this.unassignTesterSelect}
                                >
                                    {t.username}
                                </Dropdown.Item>
                            );
                        })}
                    </Dropdown.Menu>
                </Dropdown>
            </Fragment>
        );
    }

    renderAssignSelfButton(currentUserAssigned) {
        const { apgExampleName, atName, browserName } = this.props;

        let testrun = `${apgExampleName} for ${atName} on ${browserName}`;

        if (currentUserAssigned) {
            return (
                <Button
                    onClick={this.handleUnassignSelfClick}
                    aria-label={`Unassign me from the test run ${testrun}`}
                >
                    Unassign Me
                </Button>
            );
        } else {
            return (
                <Button
                    onClick={this.handleAssignSelfClick}
                    aria-label={`Assign me to the test run ${testrun}`}
                >
                    Assign Me
                </Button>
            );
        }
    }

    renderTesterList(currentUserAssigned) {
        const { testers, userId } = this.props;

        let userInfo = testers
            .filter(uid => uid !== userId)
            .map(uid => this.renderTestsCompletedByUser(uid));
        if (currentUserAssigned) {
            userInfo.unshift(this.renderTestsCompletedByUser(userId));
        }

        return userInfo;
    }

    render() {
        const {
            admin,
            cycleId,
            userId,
            runId,
            testers,
            apgExampleName
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

        let assignOptions;
        if (admin) {
            assignOptions = this.renderAssignDropdowns();
        } else {
            assignOptions = this.renderAssignSelfButton(currentUserAssigned);
        }

        let testerList = this.renderTesterList(currentUserAssigned);
        let status = 'Not started';
        if (testerList.length) {
            status = 'In Progress';
        }

        return (
            <tr key={runId}>
                <td>{designPatternLinkOrName}</td>
                <td>
                    <ul tabIndex="-1" ref={this.testerList}>
                        {testerList.length !== 0 ? (
                            testerList
                        ) : (
                            <li>No testers assigned</li>
                        )}
                    </ul>
                </td>
                <td>{status}</td>
                <td>{assignOptions}</td>
            </tr>
        );
    }
}

TestQueueRow.propTypes = {
    admin: PropTypes.bool,
    cycleId: PropTypes.number,
    runId: PropTypes.number,
    apgExampleName: PropTypes.string,
    testers: PropTypes.array,
    usersById: PropTypes.object,
    userId: PropTypes.number,
    atName: PropTypes.string,
    atNameId: PropTypes.atNameId,
    browserName: PropTypes.string,
    dispatch: PropTypes.func,
    testsForRun: PropTypes.array
};

export default connect()(TestQueueRow);
