import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import { Button, Dropdown } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import checkForConflict from '../../utils/checkForConflict';
import {
    deleteUsersFromRun,
    saveUsersToRuns,
    saveRunStatus
} from '../../actions/runs';

class TestQueueRow extends Component {
    constructor(props) {
        super(props);

        const {
            totalConflicts,
            testsWithResults
        } = this.countCompleteTestsAndConflicts();
        this.state = {
            totalConflicts,
            testsWithResults
        };

        this.handleUnassignSelfClick = this.handleUnassignSelfClick.bind(this);
        this.handleAssignSelfClick = this.handleAssignSelfClick.bind(this);
        this.assignTesterSelect = this.assignTesterSelect.bind(this);
        this.unassignTesterSelect = this.unassignTesterSelect.bind(this);
        this.updateRunStatus = this.updateRunStatus.bind(this);

        this.testerList = React.createRef();
    }

    countCompleteTestsAndConflicts() {
        const { testsForRun } = this.props;

        let totalConflicts = 0;
        let testsWithResults = 0;
        for (let test of testsForRun) {
            if (
                test.results &&
                Object.values(test.results).filter(r => r.status === 'complete')
                    .length
            ) {
                testsWithResults++;
                if (checkForConflict(test.results).length) {
                    totalConflicts++;
                }
            }
        }
        return { totalConflicts, testsWithResults };
    }

    handleUnassignSelfClick() {
        const { dispatch, userId, runId } = this.props;
        dispatch(deleteUsersFromRun([userId], runId));
    }

    handleAssignSelfClick() {
        const { dispatch, userId, runId } = this.props;
        dispatch(saveUsersToRuns([userId], [runId]));
    }

    assignTesterSelect(event) {
        const { dispatch, runId } = this.props;
        let uid = parseInt(event.target.value);
        dispatch(saveUsersToRuns([uid], [runId]));
    }

    unassignTesterSelect(event) {
        const { dispatch, runId } = this.props;
        let uid = parseInt(event.target.value);
        dispatch(deleteUsersFromRun([uid], runId));
    }

    updateRunStatus(status) {
        const { dispatch, runId } = this.props;
        dispatch(saveRunStatus(status, runId));
    }

    componentDidUpdate(prevProps) {
        // Focus on the user list after editing the user list
        if (this.props.testers.length !== prevProps.testers.length) {
            this.testerList.current.focus();
        }

        if (this.props.testsForRun.length !== prevProps.testsForRun.length) {
            const {
                totalConflicts,
                testsWithResults
            } = this.countCompleteTestsAndConflicts();

            this.setState({
                totalConflicts,
                testsWithResults
            });
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

            // You can only unassign if no tests results have been saved
            if (
                testers.includes(tester.id) &&
                !this.testsCompletedByUser[tester.id]
            ) {
                canUnassignTesters.push(tester);
            }

            // You can only assign if the tester is not assigned already
            if (
                !testers.includes(tester.id) &&
                tester.configured_ats.find(ua => ua.at_name_id === atNameId)
            ) {
                canAssignTesters.push(tester);
            }
        }
        return (
            <Fragment>
                <Dropdown className="assign-test">
                    <Dropdown.Toggle
                        id={nextId()}
                        variant="secondary"
                        aria-label={`Assign Testers to ${testrun}`}
                        disabled={canAssignTesters.length ? false : true}
                    >
                        Assign Testers
                    </Dropdown.Toggle>
                    <Dropdown.Menu role="menu">
                        {canAssignTesters.map(t => {
                            return (
                                <Dropdown.Item
                                    role="menuitem"
                                    variant="secondary"
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
                <Dropdown className="unassign-test">
                    <Dropdown.Toggle
                        id={nextId()}
                        variant="secondary"
                        aria-label={`Unassign Testers from ${testrun}`}
                        disabled={canUnassignTesters.length ? false : true}
                    >
                        Unassign Testers
                    </Dropdown.Toggle>
                    <Dropdown.Menu role="menu">
                        {canUnassignTesters.map(t => {
                            return (
                                <Dropdown.Item
                                    role="menuitem"
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
        const { runId, testers, usersById, runStatus } = this.props;

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

        // TODO: When we build out deleting, disable based on whether
        // there are results that can be deleted
        // let disableDelete = testersWithResults.length ? false : true;
        let disableDelete = true;

        // If there are no conflicts OR the test has been marked as "final",
        // and admin can mark a test run as "draft"
        let updateRunStatusButton = null;
        if (
            (runStatus !== 'draft' &&
                this.state.totalConflicts === 0 &&
                this.state.testsWithResults > 0) ||
            runStatus === 'final'
        ) {
            updateRunStatusButton = (
                <Button onClick={() => this.updateRunStatus('draft')}>
                    Mark as draft
                </Button>
            );
        }
        // If the results have been marked as draft and there is no conflict,
        // they can be marked as "final"
        else if (runStatus === 'draft' && this.state.totalConflicts === 0) {
            updateRunStatusButton = (
                <Button onClick={() => this.updateRunStatus('final')}>
                    Mark as final
                </Button>
            );
        }

        return (
            <Fragment>
                <Dropdown className="open-run-as">
                    <Dropdown.Toggle
                        id={nextId()}
                        variant="secondary"
                        aria-label={`Open run ${testrun} as tester`}
                        // disabled={testers.length ? false : true}
                    >
                        Open run as...
                    </Dropdown.Toggle>
                    <Dropdown.Menu role="menu">
                        {testers.map(t => {
                            return (
                                <Dropdown.Item
                                    role="menuitem"
                                    href={`/run/${runId}?user=${t}`}
                                    key={nextId()}
                                >
                                    {usersById[t].username}
                                </Dropdown.Item>
                            );
                        })}
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown className="delete-results">
                    <Dropdown.Toggle
                        id={nextId()}
                        variant="danger"
                        aria-label={`Delete results for ${testrun}`}
                        disabled={disableDelete}
                    >
                        Delete Results
                    </Dropdown.Toggle>
                    <Dropdown.Menu role="menu">
                        {testersWithResults.map(t => {
                            return (
                                <Dropdown.Item
                                    role="menuitem"
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
                {updateRunStatusButton}
            </Fragment>
        );
    }

    renderAssignSelfButton(currentUserAssigned) {
        const { userId } = this.props;
        let testrun = this.testRun;

        // You can only unassign yourself if you have not contributed tests
        let disabled = this.testsCompletedByUser[userId] > 0 ? true : false;

        if (currentUserAssigned) {
            return (
                <Button
                    variant="secondary"
                    onClick={this.handleUnassignSelfClick}
                    aria-label={`Unassign me from the test run ${testrun}`}
                    disabled={disabled}
                >
                    Unassign Me
                </Button>
            );
        } else {
            return (
                <Button
                    variant="secondary"
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
            <li key={nextId()}>
                <a
                    href={`https://github.com/${usersById[uid].username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {usersById[uid].username}
                </a>
                {` ${testsCompleted} of ${totalTests} tests complete`}
            </li>
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
            userId,
            runId,
            runStatus,
            testers,
            testsForRun,
            apgExampleName
        } = this.props;

        let currentUserAssigned = testers.includes(userId);

        let designPatternLinkOrName;
        if (currentUserAssigned) {
            designPatternLinkOrName = (
                <Link to={`/run/${runId}`}>{apgExampleName}</Link>
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
        let results = null;

        if (this.state.totalConflicts > 0) {
            status = `In progress with ${
                this.state.totalConflicts
            } conflicting test${this.state.totalConflicts === 1 ? '' : 's'}`;
        } else if (
            this.state.testsWithResults > 0 &&
            this.state.testsWithResults !== testsForRun.length
        ) {
            status = 'In progress with no conflicts';
        } else if (this.state.testsWithResults === testsForRun.length) {
            status = 'Tests complete with no conflicts';
        }

        if (runStatus === 'draft') {
            results = <Link to={`/results/run/${runId}`}>DRAFT RESULTS</Link>;
        } else if (runStatus === 'final') {
            results = (
                <Link to={`/results/run/${runId}`}>PUBLISHED RESULTS</Link>
            );
        }

        let actions;
        if (admin) {
            actions = (
                <Fragment>
                    {this.renderAssignDropdowns()}
                    {this.renderAdminOptions()}
                </Fragment>
            );
        } else {
            actions = (
                <Fragment>
                    {this.renderAssignSelfButton(currentUserAssigned)}
                    {this.testsCompletedByUser[userId] ? (
                        <Button variant="danger" disabled={true}>
                            Delete My Results
                        </Button>
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
                <td>
                    <div>{status}</div>
                    {results}
                </td>
                <td className="actions">{actions}</td>
            </tr>
        );
    }
}

TestQueueRow.propTypes = {
    admin: PropTypes.bool,
    runId: PropTypes.number,
    runStatus: PropTypes.string,
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
