import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faTrashAlt,
    faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import nextId from 'react-id-generator';
import { Button, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ATAlert from '../ATAlert';
import './TestQueueRun.css';

const TestQueueRun = ({
    user = {},
    testers = [],
    testPlanReport = {},
    handleAssignTester = () => {},
    handleRemoveTester = () => {}
}) => {
    const startTestingButtonRef = useRef();
    const alertMessage = useState('');

    // TODO: Pass down auth info through redux
    // TODO: Pass down report statuses from common place
    const currentUserIsAdmin = user.roles.includes('ADMIN');
    const currentUserAssigned = testPlanReport.draftTestPlanRuns.some(
        testPlanRun => testPlanRun.tester.username === user.username
    );
    const currentUserTestPlanRun = currentUserAssigned
        ? testPlanReport.draftTestPlanRuns.find(
              testPlanRun => testPlanRun.tester.username === user.username
          )
        : {};
    const testPlanRunTesters = testPlanReport.draftTestPlanRuns;

    const renderAssignedUserToTestPlan = () => {
        // Determine if current user is assigned to testPlan
        if (currentUserAssigned)
            return (
                <Link to={`/run/${currentUserTestPlanRun.id}`}>
                    {testPlanReport.testPlanVersion.title}
                </Link>
            );
        return testPlanReport.testPlanVersion.title;
    };

    const renderAssignMenu = () => {
        let testersToAssign = testers.filter(
            tester =>
                tester.roles.includes('TESTER') ||
                tester.roles.includes('ADMIN')
        );

        return (
            <>
                <Dropdown aria-label="Assign testers menu">
                    <Dropdown.Toggle
                        aria-label="Assign testers"
                        className="assign-tester"
                        variant="secondary"
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {testersToAssign.length ? (
                            testersToAssign.map(tester => {
                                let classname = currentUserAssigned
                                    ? 'assigned'
                                    : 'not-assigned';
                                return (
                                    <Dropdown.Item
                                        variant="secondary"
                                        as="button"
                                        key={nextId()}
                                        onClick={() => {}}
                                        aria-checked={currentUserAssigned}
                                        role="menuitemcheckbox"
                                    >
                                        {currentUserAssigned && (
                                            <FontAwesomeIcon icon={faCheck} />
                                        )}
                                        <span className={classname}>
                                            {`${tester.username}`}
                                        </span>
                                    </Dropdown.Item>
                                );
                            })
                        ) : (
                            <Dropdown.Item
                                disabled
                                variant="secondary"
                                as="button"
                                key={nextId()}
                                onClick={() => {}}
                                aria-checked="disabled"
                                role="menuitemcheckbox"
                            >
                                <span className="not-assigned">
                                    No testers to assign
                                </span>
                            </Dropdown.Item>
                        )}
                    </Dropdown.Menu>
                </Dropdown>
            </>
        );
    };

    const evaluateTestRunTitle = () => {
        const { testPlanTarget, testPlanVersion } = testPlanReport;
        const { title: testPlanTargetName } = testPlanTarget;
        const { name: apgExampleName } = testPlanVersion;

        return `${apgExampleName} for ${testPlanTargetName}`;
    };

    const renderOpenAsDropdown = () => {
        const { id: runId } = currentUserTestPlanRun;

        return (
            <Dropdown className="open-run-as">
                <Dropdown.Toggle
                    id={nextId()}
                    variant="secondary"
                    aria-label={`Open run ${evaluateTestRunTitle()} as tester`}
                    disabled={!testPlanRunTesters.length}
                >
                    Open run as...
                </Dropdown.Toggle>
                <Dropdown.Menu role="menu">
                    {testPlanRunTesters.map(t => {
                        return (
                            <Dropdown.Item
                                role="menuitem"
                                href={`/run/${runId}?user=${t.tester.id}`}
                                key={nextId()}
                            >
                                {t.tester.username}
                            </Dropdown.Item>
                        );
                    })}
                </Dropdown.Menu>
            </Dropdown>
        );
    };

    const renderDeleteMenu = () => {
        // eslint-disable-next-line no-unused-vars
        const { id: runId } = currentUserTestPlanRun;
        let testPlanRunsWithResults = getTestPlanRunsWithResults();

        if (testPlanRunsWithResults.length) {
            return (
                <>
                    <Dropdown aria-label="Delete results menu">
                        <Dropdown.Toggle variant="danger">
                            <FontAwesomeIcon icon={faTrashAlt} />
                            Delete for...
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {testPlanRunsWithResults.map(t => {
                                return (
                                    <Dropdown.Item
                                        role="menuitem"
                                        variant="secondary"
                                        as="button"
                                        key={nextId()}
                                        onClick={() => {
                                            // showDeleteResultsModal(t.username, activeRunsById[runId], async () =>
                                            //     await this.handleDeleteResultsForUser(t.id)
                                            // )
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                        {t.tester.username}
                                    </Dropdown.Item>
                                );
                            })}
                        </Dropdown.Menu>
                    </Dropdown>
                </>
            );
        }
    };

    const updateReportStatus = status => {
        // eslint-disable-next-line no-console
        console.info('TODO: IMPLEMENT ME', status);
    };

    const evaluateStatusAndResults = () => {
        const { status: runStatus, conflictCount = 0 } = testPlanReport;
        const { id: runId } = currentUserTestPlanRun;

        let status, results;

        if (conflictCount > 0) {
            let pluralizedStatus = `${conflictCount} Conflict${
                conflictCount === 1 ? '' : 's'
            }`;
            status = (
                <span className="status-label conflicts">
                    {pluralizedStatus}
                </span>
            );
        } else if (runStatus === 'DRAFT' || !runStatus) {
            status = <span className="status-label not-started">Draft</span>;
        } else if (runStatus === 'IN_REVIEW') {
            status = (
                <span className="status-label in-progress">In Review</span>
            );
            results = (
                <Link className="reports-link" to={`/results/run/${runId}`}>
                    View Results
                </Link>
            );
        } else if (runStatus === 'FINALIZED') {
            status = <span className="status-label complete">Final</span>;
            results = (
                <Link className="reports-link" to={`/results/run/${runId}`}>
                    View Final Results
                </Link>
            );
        }

        return { status, results };
    };

    const getTestPlanRunsWithResults = () => {
        const { draftTestPlanRuns } = testPlanReport;
        return draftTestPlanRuns.filter(
            testPlanRun => testPlanRun.testResultCount > 0
        );
    };

    // TODO: Can rewrite as a state machine from server side maybe?
    const evaluateNewReportStatus = () => {
        const { status, conflictCount = 0 } = testPlanReport;
        const testersWithResults = getTestPlanRunsWithResults();

        // If there are no conflicts OR the test has been marked as "final",
        // and admin can mark a test run as "draft"
        let newStatus;
        if (
            (status !== 'DRAFT' &&
                conflictCount === 0 &&
                testersWithResults.length > 0) ||
            status === 'FINALIZED'
        ) {
            newStatus = 'IN_REVIEW';
        }
        // If the results have been marked as draft and there is no conflict,
        // they can be marked as "final"
        else if (
            status === 'DRAFT' &&
            conflictCount === 0 &&
            testersWithResults.length > 0
        ) {
            newStatus = 'FINALIZED';
        }
        return newStatus;
    };

    const { status, results } = evaluateStatusAndResults();
    const nextReportStatus = evaluateNewReportStatus();

    return (
        <tr>
            <th>{renderAssignedUserToTestPlan()}</th>
            <td>
                <div className="testers-wrapper">
                    {currentUserIsAdmin && renderAssignMenu()}
                    <div className="assign-actions">
                        {!currentUserAssigned && (
                            <Button
                                variant="secondary"
                                onClick={handleAssignTester}
                                aria-label={`Assign yourself to the test run ${evaluateTestRunTitle()}`}
                                className="assign-self"
                            >
                                Assign Yourself
                            </Button>
                        )}
                        {currentUserAssigned && (
                            <Button
                                variant="secondary"
                                onClick={handleRemoveTester}
                                aria-label={`Unassign yourself from the test run ${evaluateTestRunTitle()}`}
                                className="assign-self"
                            >
                                Unassign Yourself
                            </Button>
                        )}
                    </div>
                </div>
                <div className="secondary-actions">
                    <ul className="assignees">
                        {testPlanReport.draftTestPlanRuns.length !== 0 ? (
                            testPlanReport.draftTestPlanRuns.map(
                                testPlanRun => (
                                    <li key={nextId()}>
                                        <a
                                            href={`https://github.com/${testPlanRun.tester.username}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {testPlanRun.tester.username}
                                        </a>
                                        <br />
                                        {` (${testPlanRun.testResultCount} of ${testPlanReport.testPlanVersion.testCount} tests complete)`}
                                    </li>
                                )
                            )
                        ) : (
                            <li className="no-assignees">
                                No testers assigned
                            </li>
                        )}
                    </ul>
                </div>
            </td>
            <td>
                <div className="status-wrapper">{status}</div>
                <div className="secondary-actions">
                    {currentUserIsAdmin && nextReportStatus && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    updateReportStatus(nextReportStatus)
                                }
                            >
                                Mark as {nextReportStatus}
                            </Button>
                            {nextReportStatus === 'Final' ? (
                                <Button
                                    variant="link"
                                    className="mt-1"
                                    onClick={() => updateReportStatus('DRAFT')}
                                >
                                    Mark as Draft
                                </Button>
                            ) : (
                                <></>
                            )}
                        </>
                    )}
                    {results}
                </div>
            </td>
            <td className="actions">
                {currentUserAssigned && (
                    <div className="test-cta-wrapper">
                        <Button
                            variant="primary"
                            href={`/run/${currentUserTestPlanRun.id}`}
                            disabled={!currentUserAssigned}
                            ref={startTestingButtonRef}
                        >
                            {currentUserTestPlanRun.testResultCount > 0 &&
                            currentUserTestPlanRun.testResultCount <
                                testPlanReport.testPlanVersion.testCount
                                ? 'Continue testing'
                                : 'Start testing'}
                        </Button>
                    </div>
                )}
                <div className="secondary-actions">
                    {currentUserIsAdmin && renderOpenAsDropdown()}
                    {currentUserIsAdmin && renderDeleteMenu()}

                    {/*TODO: May no longer be relevant because no 'COMPLETE/FINAL' test runs are on this page*/}
                    {/*{(!currentUserIsAdmin &&*/}
                    {/*    this.testsCompletedByUser[userId] && (*/}
                    {/*        <Button*/}
                    {/*            variant="danger"*/}
                    {/*            onClick={() => {*/}
                    {/*                // showDeleteResultsModal(*/}
                    {/*                //     usersById[userId].username,*/}
                    {/*                //     activeRunsById[runId],*/}
                    {/*                //     async () =>*/}
                    {/*                //         await this.handleDeleteResultsForUser(*/}
                    {/*                //             userId*/}
                    {/*                //         )*/}
                    {/*                // )*/}
                    {/*            }}*/}
                    {/*            aria-label="Delete my results"*/}
                    {/*        >*/}
                    {/*            <FontAwesomeIcon icon={faTrashAlt} />*/}
                    {/*            Delete Results*/}
                    {/*        </Button>*/}
                    {/*    )) ||*/}
                    {/*    ''}*/}

                    <ATAlert message={alertMessage} />
                </div>
            </td>
        </tr>
    );
};

export default TestQueueRun;

/*class TestQueueRun extends Component {
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
        const { testsForRun, runStatus } = this.props;

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

        // Update the run status back to raw if there are no test results
        if (testsWithResults === 0 && runStatus !== 'raw') {
            this.updateRunStatus('raw');
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
        this.setState({
            alertMessage: 'You have been assigned to this test run.'
        });
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
        let statusMap = {
            Draft: 'raw',
            'In Review': 'draft',
            Final: 'final'
        };
        const { dispatch, runId } = this.props;
        dispatch(saveRunStatus(statusMap[status], runId));
    }

    async handleDeleteResultsForUser(userId) {
        const { dispatch, runId } = this.props;
        await dispatch(deleteTestResults(userId, runId));

        // Recount the number of tests with results
        const { testsWithResults } = this.countCompleteTestsAndConflicts();
        this.setState({
            testsWithResults
        });
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
                <br />
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
                    disabled={testers.length ? false : true}
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
        const { runId, runStatus } = this.props;
        let status, results;

        if (this.state.totalConflicts > 0) {
            let pluralizedStatus = `${this.state.totalConflicts} Conflict${
                this.state.totalConflicts === 1 ? '' : 's'
            }`;
            status = (
                <span className="status-label conflicts">
                    {pluralizedStatus}
                </span>
            );
        } else if (runStatus === 'raw' || !runStatus) {
            status = <span className="status-label not-started">Draft</span>;
        } else if (runStatus === 'draft') {
            status = (
                <span className="status-label in-progress">In Review</span>
            );
            results = (
                <Link className="reports-link" to={`/results/run/${runId}`}>
                    View Results
                </Link>
            );
        } else if (runStatus === 'final') {
            status = <span className="status-label complete">Final</span>;
            results = (
                <Link className="reports-link" to={`/results/run/${runId}`}>
                    View Final Results
                </Link>
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
            newStatus = 'In Review';
        }
        // If the results have been marked as draft and there is no conflict,
        // they can be marked as "final"
        else if (
            runStatus === 'draft' &&
            this.state.totalConflicts === 0 &&
            this.state.testsWithResults > 0
        ) {
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

    renderAssignMenu() {
        const canAssignTesters = this.generateAssignableTesters();

        return (
            <Fragment>
                <Dropdown aria-label="Assign testers menu">
                    <Dropdown.Toggle
                        aria-label="Assign testers"
                        className="assign-tester"
                        variant="secondary"
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
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
        const { showDeleteResultsModal, activeRunsById, runId } = this.props;
        let testersWithResults = this.generateTestersWithResults();

        if (testersWithResults.length) {
            return (
                <Fragment>
                    <Dropdown aria-label="Delete results menu">
                        <Dropdown.Toggle variant="danger">
                            <FontAwesomeIcon icon={faTrashAlt} />
                            Delete for...
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
                                            showDeleteResultsModal(
                                                t.username,
                                                activeRunsById[runId],
                                                async () =>
                                                    await this.handleDeleteResultsForUser(
                                                        t.id
                                                    )
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
            activeRunsById,
            admin,
            userId,
            usersById,
            runId,
            testers,
            testsForRun,
            apgExampleName,
            showDeleteResultsModal
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
                    <div className="testers-wrapper">
                        {admin && this.renderAssignMenu()}
                        <div className="assign-actions">
                            {!currentUserAssigned && (
                                <Button
                                    variant="secondary"
                                    onClick={this.handleAssignSelfClick}
                                    aria-label={`Assign yourself to the test run ${this.testRun()}`}
                                    className="assign-self"
                                >
                                    Assign Yourself
                                </Button>
                            )}
                            {currentUserAssigned && (
                                <Button
                                    variant="secondary"
                                    onClick={this.handleUnassignSelfClick}
                                    aria-label={`Unassign yourself from the test run ${this.testRun()}`}
                                    className="assign-self"
                                >
                                    Unassign Yourself
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="secondary-actions">
                        <ul className="assignees">
                            {testerList.length !== 0 ? (
                                testerList
                            ) : (
                                <li className="no-assignees">
                                    No testers assigned
                                </li>
                            )}
                        </ul>
                    </div>
                </td>
                <td>
                    <div className="status-wrapper">{status}</div>
                    <div className="secondary-actions">
                        {admin && newStatus && (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        this.updateRunStatus(newStatus)
                                    }
                                >
                                    Mark as {newStatus}
                                </Button>
                                {newStatus === 'Final' ? (
                                    <Button
                                        variant="link"
                                        className="mt-1"
                                        onClick={() =>
                                            this.updateRunStatus('Draft')
                                        }
                                    >
                                        Mark as Draft
                                    </Button>
                                ) : (
                                    <></>
                                )}
                            </>
                        )}
                        {results}
                    </div>
                </td>
                <td className="actions">
                    {currentUserAssigned && (
                        <div className="test-cta-wrapper">
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
                        </div>
                    )}
                    <div className="secondary-actions">
                        {admin && this.renderOpenAsDropdown()}
                        {admin && this.renderDeleteMenu()}
                        {(!admin && this.testsCompletedByUser[userId] && (
                            <Button
                                variant="danger"
                                onClick={() =>
                                    showDeleteResultsModal(
                                        usersById[userId].username,
                                        activeRunsById[runId],
                                        async () =>
                                            await this.handleDeleteResultsForUser(
                                                userId
                                            )
                                    )
                                }
                                aria-label="Delete my results"
                            >
                                <FontAwesomeIcon icon={faTrashAlt} />
                                Delete Results
                            </Button>
                        )) ||
                            ''}
                        <ATAlert message={this.state.alertMessage} />
                    </div>
                </td>
            </tr>
        );
    }
}

TestQueueRun.propTypes = {
    activeRunsById: PropTypes.object,
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
    testsForRun: PropTypes.array,
    showDeleteResultsModal: PropTypes.func
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

export default connect(mapStateToProps)(TestQueueRun);*/
