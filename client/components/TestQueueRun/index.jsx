import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import nextId from 'react-id-generator';
import { Button, Dropdown } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import checkForConflict from '../../utils/checkForConflict';
import {
    deleteTestResults,
    deleteUsersFromRun,
    saveUsersToRuns,
    saveRunStatus
} from '../../actions/runs';
import './TestQueueRun.css';

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
        this.toggleTesterAssign = this.toggleTesterAssign.bind(this);
        this.handleDeleteResultsForUser = this.handleDeleteResultsForUser.bind(
            this
        );
        this.updateRunStatus = this.updateRunStatus.bind(this);

        this.startTestingButton = React.createRef();
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

    toggleTesterAssign(uid) {
        const { dispatch, runId, testers } = this.props;
        if (testers.includes(uid)) {
            dispatch(deleteUsersFromRun([uid], runId));
        } else {
            dispatch(saveUsersToRuns([uid], [runId]));
        }
    }

    updateRunStatus(status) {
        const { dispatch, runId } = this.props;
        dispatch(saveRunStatus(status.toLowerCase(), runId));
    }

    handleDeleteResultsForUser(userId) {
        const { dispatch, runId } = this.props;
        dispatch(deleteTestResults(userId, runId));
    }

    componentDidUpdate(prevProps) {
        // Focus on the start testing button after assigning yourself
        const { userId, testers } = this.props;
        if (testers.includes(userId) && !prevProps.testers.includes(userId)) {
            this.startTestingButton.current.focus();
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
                {` (${testsCompleted} of ${totalTests} tests complete)`}
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

    renderOpenAsDropdown() {
        const { runId, testers, usersById } = this.props;

        let testrun = this.testRun();

        return (
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
        );
    }

    renderStatusAndResult() {
        const { runId, runStatus, testsForRun } = this.props;

        let status = <span className="status-label not-started">Not Started</span>;
        let results = null;

        if (this.state.totalConflicts > 0) {
            status = `In progress with ${
                this.state.totalConflicts
            } conflicting test${this.state.totalConflicts === 1 ? '' : 's'}`;
        } else if (
            this.state.testsWithResults > 0 &&
            this.state.testsWithResults !== testsForRun.length
        ) {
            status = <span className="status-label in-progress">In Progress</span>;
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

        return { status, results };
    }

    generateRunStatus() {
        const { runStatus } = this.props;

        // If there are no conflicts OR the test has been marked as "final",
        // and admin can mark a test run as "draft"
        let newStatus;
        if (
            (runStatus !== 'draft' &&
                this.state.totalConflicts === 0 &&
                this.state.testsWithResults > 0) ||
            runStatus === 'final'
        ) {
            newStatus = 'Draft';
        }
        // If the results have been marked as draft and there is no conflict,
        // they can be marked as "final"
        else if (runStatus === 'draft' && this.state.totalConflicts === 0) {
            newStatus = 'Final';
        }
        return newStatus;
    }

    generateAssignableTesters() {
        const { atNameId, testers, usersById } = this.props;

        let canAssignTesters = [];
        for (let uid of Object.keys(usersById)) {
            const tester = usersById[uid];

            if (tester.configured_ats.find(ua => ua.at_name_id === atNameId)) {
                canAssignTesters.push({
                    ...tester,
                    assigned: testers.includes(tester.id)
                });
            }
        }

        return canAssignTesters;
    }

    renderAssignMenu(admin) {
        const { userId } = this.props;

        const canAssignTesters = this.generateAssignableTesters();

        return (
            <Fragment>
                <Dropdown aria-label="Assign testers menu">
                    <Dropdown.Toggle>
                        <FontAwesomeIcon icon={faPlus} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {canAssignTesters.map(t => {
                            let classname = t.assigned
                                ? 'assigned'
                                : 'not-assigned';
                            return (
                                <Dropdown.Item
                                    variant="secondary"
                                    as="button"
                                    key={nextId()}
                                    onClick={() =>
                                        this.toggleTesterAssign(t.id)
                                    }
                                    disabled={!admin && t.id !== userId}
                                    aria-checked={t.assigned}
                                    role="menuitemcheckbox"
                                >
                                    {t.assigned && (
                                        <FontAwesomeIcon icon={faCheck} />
                                    )}
                                    <span className={classname}>
                                        {`${t.username} `}
                                        <span className="fullname">
                                            {t.fullname}
                                        </span>
                                    </span>
                                </Dropdown.Item>
                            );
                        })}
                    </Dropdown.Menu>
                </Dropdown>
            </Fragment>
        );
    }

    generateTestersWithResults() {
        const { testers, usersById } = this.props;

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

        return testersWithResults;
    }

    renderDeleteMenu() {
        let testersWithResults = this.generateTestersWithResults();

        if (testersWithResults.length) {
            return (
                <Fragment>
                    <Dropdown aria-label="Delete results menu">
                        <Dropdown.Toggle>
                            <FontAwesomeIcon icon={faTrashAlt} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {testersWithResults.map(t => {
                                return (
                                    <Dropdown.Item
                                        role="menuitem"
                                        variant="secondary"
                                        as="button"
                                        key={nextId()}
                                        onClick={() =>
                                            this.handleDeleteResultsForUser(
                                                t.id
                                            )
                                        }
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                        {t.username}
                                    </Dropdown.Item>
                                );
                            })}
                        </Dropdown.Menu>
                    </Dropdown>
                </Fragment>
            );
        }
    }

    renderAdminActionMenu() {
        return (
            <Dropdown.Menu role="menu">
                {this.renderAssignOptions(true)}
                {this.renderRunStatusChangeOption()}
                {this.renderDeleteOptions()}
            </Dropdown.Menu>
        );
    }

    render() {
        const {
            admin,
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

        this.testsCompletedOrInProgressByThisUser = testsForRun.filter(t => {
            return t.results && t.results[userId];
        }).length;

        let testerList = this.renderTesterList(currentUserAssigned);

        let { status, results } = this.renderStatusAndResult();
        const newStatus = this.generateRunStatus();

        return (
            <tr key={runId}>
                <th>{designPatternLinkOrName}</th>
                <td>
                    <ul>
                        {testerList.length !== 0 ? (
                            testerList
                        ) : (
                            <li>No testers assigned</li>
                        )}
                        {!currentUserAssigned && (
                            <li>
                                <Button
                                    onClick={this.handleAssignSelfClick}
                                    aria-label={`Assign yourself to the test run ${this.testRun()}`}
                                    variant="link"
                                    className="assign-self"
                                >
                                    Assign Yourself
                                </Button>
                            </li>
                        )}
                        {this.renderAssignMenu(admin)}
                    </ul>
                </td>
                <td>
                    <ul>
                        <li>
                            <div tabIndex="0">{status}</div>
                        </li>
                        <li>{results}</li>
                        {admin && newStatus && (
                            <li>
                                <Button
                                    onClick={() =>
                                        this.updateRunStatus(newStatus)
                                    }
                                >
                                    Mark status as {newStatus}
                                </Button>
                            </li>
                        )}
                    </ul>
                </td>
                <td className="actions">
                    <div className="primary-buttons">
                        <Button
                            variant="primary"
                            href={`/run/${runId}`}
                            disabled={!currentUserAssigned}
                            ref={this.startTestingButton}
                        >
                            {this.testsCompletedOrInProgressByThisUser
                                ? 'Continue testing'
                                : 'Start testing'}
                        </Button>
                        {admin && this.renderOpenAsDropdown()}
                    </div>
                    {admin && this.renderDeleteMenu()}
                    {(!admin && this.testsCompletedByUser[userId] && (
                        <Button
                            onClick={() =>
                                this.handleDeleteResultsForUser(userId)
                            }
                            aria-label="Delete my results"
                        >
                            <FontAwesomeIcon icon={faTrashAlt} />
                        </Button>
                    )) ||
                        ''}
                </td>
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

const mapStateToProps = (state, ownProps) => {
    const { activeRunsById } = state.runs;
    const { usersById } = state.users;
    const { runId } = ownProps;
    const userId = state.user.id;

    const run = activeRunsById[runId];
    const { apg_example_name, testers, at_name_id, run_status, tests } = run;

    return {
        apgExampleName: apg_example_name,
        testers,
        atNameId: at_name_id,
        runStatus: run_status,
        runId,
        testsForRun: tests,
        activeRunsById,
        usersById,
        userId
    };
};

export default connect(mapStateToProps)(TestQueueRow);
