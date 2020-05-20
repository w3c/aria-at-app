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

    testRun() {
        const { apgExampleName, atName, browserName } = this.props;

        return `${apgExampleName} for ${atName} on ${browserName}`;
    }

    renderAssignDropdowns() {
        const { atNameId, testers, usersById } = this.props;

        let testrun = this.testRun();
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

    renderAdminOptions() {
        const { testers, usersById } = this.props;

        let testrun = this.testRun();

        let testersWithResults = [];
        for (let uid of Object.keys(usersById)) {
            const tester = usersById[uid];
            if (
                testers.includes(tester.id) &&
                this.testsCompletedByUser[tester.id]
            ) {
                testersWithResults.push(tester);
            }
        }
        return (
            <Fragment>
                <Dropdown>
                    <Dropdown.Toggle
                        id={nextId()}
                        aria-label={`Delete results for ${testrun}`}
                        disabled={testersWithResults.length ? false : true}
                    >
                        Delete Results
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {testersWithResults.map(t => {
                            return (
                                <Dropdown.Item
                                    as="button"
                                    key={nextId()}
                                    value={t.id}
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
                        aria-label={`Open run ${testrun} as tester`}
                        disabled={testersWithResults.length ? false : true}
                    >
                        Open run as...
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {testersWithResults.map(t => {
                            return (
                                <Dropdown.Item
                                    as="button"
                                    key={nextId()}
                                    value={t.id}
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

    renderDraftOptions() {
        return;
    }

    renderAssignSelfButton(currentUserAssigned) {
        let testrun = this.testRun;

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

    renderTestsCompletedByUser(uid) {
        const { testsForRun, usersById } = this.props;
        let totalTests = testsForRun.length;
        let testsCompleted = this.testsCompletedByUser[uid];
        return (
            <li
                key={nextId()}
            >{`${usersById[uid].username} ${testsCompleted} of ${totalTests} tests complete`}</li>
        );
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
            testsForRun,
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

        this.testsCompletedByUser = testers.reduce((acc, uid) => {
            acc[uid] = testsForRun.filter(
                t =>
                    t.results &&
                    t.results[uid] &&
                    t.results[uid].status === 'complete'
            ).length;
            return acc;
        }, {});

        let testerList = this.renderTesterList(currentUserAssigned);
        let status = 'Not started';
        if (testerList.length) {
            status = 'In Progress';
        }

        let actions;
        if (admin) {
            actions = (
                <Fragment>
                    {this.renderAssignDropdowns()}
                    {this.renderAdminOptions()}
                    <Button>Mark As Draft</Button>
                </Fragment>
            );
        } else {
            actions = (
                <Fragment>
                    {this.renderAssignSelfButton(currentUserAssigned)}
                    {this.testsCompletedByUser[userId] ? (
                        <Button>Delete My Results</Button>
                    ) : (
                        undefined
                    )}
                </Fragment>
            );
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
                <td>{actions}</td>
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
    atNameId: PropTypes.number,
    browserName: PropTypes.string,
    dispatch: PropTypes.func,
    testsForRun: PropTypes.array
};

export default connect()(TestQueueRow);
