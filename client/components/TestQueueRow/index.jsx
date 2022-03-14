import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
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
import { capitalizeEachWord } from '../../utils/formatter';
import './TestQueueRow.css';
import {
    ASSIGN_TESTER_MUTATION,
    UPDATE_TEST_PLAN_REPORT_MUTATION,
    REMOVE_TEST_PLAN_REPORT_MUTATION,
    REMOVE_TESTER_MUTATION,
    REMOVE_TESTER_RESULTS_MUTATION
} from '../TestQueue/queries';
import { gitUpdatedDateToString } from '../../utils/gitUtils';
import TestPlanUpdaterModal from '../TestPlanUpdater/TestPlanUpdaterModal';

const TestQueueRow = ({
    user = {},
    testers = [],
    testPlanReport = {},
    triggerDeleteTestPlanReportModal = () => {},
    triggerDeleteResultsModal = () => {},
    triggerTestPlanReportUpdate = () => {}
}) => {
    const [alertMessage, setAlertMessage] = useState('');

    const [assignTester] = useMutation(ASSIGN_TESTER_MUTATION);
    const [updateTestPlanReportStatus] = useMutation(
        UPDATE_TEST_PLAN_REPORT_MUTATION
    );
    const [removeTestPlanReport] = useMutation(
        REMOVE_TEST_PLAN_REPORT_MUTATION
    );
    const [removeTester] = useMutation(REMOVE_TESTER_MUTATION);
    const [removeTesterResults] = useMutation(REMOVE_TESTER_RESULTS_MUTATION);

    const [showTestPlanUpdaterModal, setShowTestPlanUpdaterModal] = useState(
        false
    );

    const { id, isAdmin, username } = user;
    const {
        id: testPlanReportId,
        testPlanTarget,
        testPlanVersion,
        draftTestPlanRuns,
        runnableTests
    } = testPlanReport;

    const isSignedIn = !!id;

    const checkIsTesterAssigned = username => {
        return draftTestPlanRuns.some(
            testPlanRun => testPlanRun.tester.username === username
        );
    };

    const currentUserAssigned = checkIsTesterAssigned(username);
    const currentUserTestPlanRun = currentUserAssigned
        ? draftTestPlanRuns.find(({ tester }) => tester.username === username)
        : {};

    const testPlanRunsWithResults = draftTestPlanRuns.filter(
        ({ testResults }) => testResults.length > 0
    );

    const getTestPlanRunIdByUserId = userId => {
        return draftTestPlanRuns.find(({ tester }) => tester.id === userId).id;
    };

    const toggleTesterAssign = async username => {
        const isTesterAssigned = checkIsTesterAssigned(username);
        const tester = testers.find(tester => tester.username === username);

        if (isTesterAssigned) {
            await removeTester({
                variables: {
                    testReportId: testPlanReport.id,
                    testerId: tester.id
                }
            });
        } else {
            await assignTester({
                variables: {
                    testReportId: testPlanReport.id,
                    testerId: tester.id
                }
            });
        }

        await triggerTestPlanReportUpdate();
    };

    const handleRemoveTestPlanReport = async () => {
        await removeTestPlanReport({
            variables: {
                testReportId: testPlanReport.id
            }
        });
        await triggerTestPlanReportUpdate();
    };

    const handleRemoveTesterResults = async testPlanRunId => {
        await removeTesterResults({
            variables: {
                testPlanRunId
            }
        });

        // force data after assignment changes
        await triggerTestPlanReportUpdate();
    };

    const renderAssignedUserToTestPlan = () => {
        const gitUpdatedDateString = (
            <p className="git-string">
                Published {gitUpdatedDateToString(testPlanVersion.updatedAt)}
            </p>
        );
        const updateTestPlanVersionButton = isAdmin ? (
            <Button
                className="updater-button"
                onClick={() => setShowTestPlanUpdaterModal(true)}
            >
                {' '}
                Update Test Plan Version
            </Button>
        ) : (
            ''
        );
        // Determine if current user is assigned to testPlan
        if (currentUserAssigned)
            return (
                <>
                    <Link
                        className="test-plan"
                        to={`/run/${currentUserTestPlanRun.id}`}
                    >
                        {testPlanVersion.title ||
                            `"${testPlanVersion.testPlan.directory}"`}
                    </Link>
                    {gitUpdatedDateString}
                    {updateTestPlanVersionButton}
                </>
            );

        if (!isSignedIn)
            return (
                <>
                    <Link to={`/test-plan-report/${testPlanReport.id}`}>
                        {testPlanVersion.title ||
                            `"${testPlanVersion.testPlan.directory}"`}
                    </Link>
                    {gitUpdatedDateString}
                </>
            );

        return (
            <div>
                {testPlanVersion.title ||
                    `"${testPlanVersion.testPlan.directory}"`}
                {gitUpdatedDateString}
                {updateTestPlanVersionButton}
            </div>
        );
    };

    const renderAssignMenu = () => {
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
                    <Dropdown.Menu role="menu">
                        {testers.length ? (
                            testers.map(({ username }) => {
                                const isTesterAssigned = checkIsTesterAssigned(
                                    username
                                );
                                let classname = isTesterAssigned
                                    ? 'assigned'
                                    : 'not-assigned';
                                return (
                                    <Dropdown.Item
                                        role="menuitem"
                                        variant="secondary"
                                        as="button"
                                        key={nextId()}
                                        onClick={async () => {
                                            await toggleTesterAssign(username);
                                            setAlertMessage(
                                                `You have been ${
                                                    classname.includes('not')
                                                        ? 'removed from'
                                                        : 'assigned to'
                                                } this test run.`
                                            );
                                        }}
                                        aria-checked={isTesterAssigned}
                                    >
                                        {isTesterAssigned && (
                                            <FontAwesomeIcon icon={faCheck} />
                                        )}
                                        <span className={classname}>
                                            {`${username}`}
                                        </span>
                                    </Dropdown.Item>
                                );
                            })
                        ) : (
                            <span className="not-assigned">
                                No testers to assign
                            </span>
                        )}
                    </Dropdown.Menu>
                </Dropdown>
            </>
        );
    };

    const evaluateTestPlanRunTitle = () => {
        const { title: testPlanTargetName } = testPlanTarget;
        const { title: apgExampleName, directory } = testPlanVersion;

        return `${apgExampleName || directory} for ${testPlanTargetName}`;
    };

    const renderOpenAsDropdown = () => {
        return (
            <Dropdown className="open-run-as">
                <Dropdown.Toggle
                    id={nextId()}
                    variant="secondary"
                    aria-label="Run as other tester"
                    disabled={!draftTestPlanRuns.length}
                >
                    Open run as...
                </Dropdown.Toggle>
                <Dropdown.Menu role="menu">
                    {draftTestPlanRuns.map(({ tester }) => {
                        return (
                            <Dropdown.Item
                                role="menuitem"
                                href={`/run/${getTestPlanRunIdByUserId(
                                    tester.id
                                )}?user=${tester.id}`}
                                key={nextId()}
                            >
                                {tester.username}
                            </Dropdown.Item>
                        );
                    })}
                </Dropdown.Menu>
            </Dropdown>
        );
    };

    const renderDeleteMenu = () => {
        if (testPlanRunsWithResults.length) {
            return (
                <>
                    <Dropdown aria-label="Delete results menu">
                        <Dropdown.Toggle variant="danger">
                            <FontAwesomeIcon icon={faTrashAlt} />
                            Delete for...
                        </Dropdown.Toggle>
                        <Dropdown.Menu role="menu">
                            {testPlanRunsWithResults.map(({ id, tester }) => {
                                return (
                                    <Dropdown.Item
                                        role="menuitem"
                                        variant="secondary"
                                        as="button"
                                        key={nextId()}
                                        onClick={() => {
                                            triggerDeleteResultsModal(
                                                evaluateTestPlanRunTitle(),
                                                tester.username,
                                                () =>
                                                    handleRemoveTesterResults(
                                                        id
                                                    )
                                            );
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                        {tester.username}
                                    </Dropdown.Item>
                                );
                            })}
                        </Dropdown.Menu>
                    </Dropdown>
                </>
            );
        }
    };

    const updateReportStatus = async status => {
        await updateTestPlanReportStatus({
            variables: {
                testReportId: testPlanReport.id,
                status: status
            }
        });
        await triggerTestPlanReportUpdate();
    };

    const evaluateStatusAndResults = () => {
        const { status: runStatus, conflicts } = testPlanReport;

        let status, results;
        const conflictCount = conflicts.length;

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
        }

        return { status, results };
    };

    const evaluateNewReportStatus = () => {
        const { status, conflicts } = testPlanReport;
        const conflictCount = conflicts.length;

        // If there are no conflicts OR the test has been marked as "final",
        // and admin can mark a test run as "draft"
        let newStatus;
        if (
            (status !== 'IN_REVIEW' &&
                conflictCount === 0 &&
                testPlanRunsWithResults.length > 0) ||
            status === 'FINALIZED'
        ) {
            newStatus = 'IN_REVIEW';
        }
        // If the results have been marked as draft and there is no conflict,
        // they can be marked as "final"
        else if (
            status === 'IN_REVIEW' &&
            conflictCount === 0 &&
            testPlanRunsWithResults.length > 0
        ) {
            newStatus = 'FINALIZED';
        }
        return newStatus;
    };

    const { status, results } = evaluateStatusAndResults();
    const nextReportStatus = evaluateNewReportStatus();

    const getRowId = tester =>
        [
            'plan',
            testPlanReport.id,
            'run',
            currentUserTestPlanRun.id,
            'assignee',
            tester.username,
            'completed'
        ].join('-');

    return (
        <>
            <tr className="test-queue-run-row">
                <th>{renderAssignedUserToTestPlan()}</th>
                <td>
                    {isSignedIn && (
                        <div className="testers-wrapper">
                            {isAdmin && renderAssignMenu()}
                            <div className="assign-actions">
                                <Button
                                    variant="secondary"
                                    onClick={() => toggleTesterAssign(username)}
                                    className="assign-self"
                                >
                                    {!currentUserAssigned
                                        ? 'Assign Yourself'
                                        : 'Unassign Yourself'}
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className={(isSignedIn && 'secondary-actions') || ''}>
                        {draftTestPlanRuns.length !== 0 ? (
                            <ul className="assignees">
                                {draftTestPlanRuns.map(
                                    ({ tester, testResults }) => (
                                        <li key={nextId()}>
                                            <a
                                                href={
                                                    `https://github.com/` +
                                                    `${tester.username}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                // Allows ATs to read the number of
                                                // completed tests when tabbing to this
                                                // link
                                                aria-describedby={getRowId(
                                                    tester
                                                )}
                                            >
                                                {tester.username}
                                            </a>
                                            <div id={getRowId(tester)}>
                                                {`(${testResults.reduce(
                                                    (acc, { completedAt }) =>
                                                        acc +
                                                        (completedAt ? 1 : 0),
                                                    0
                                                )} of ${
                                                    runnableTests.length
                                                } tests complete)`}
                                            </div>
                                        </li>
                                    )
                                )}
                            </ul>
                        ) : (
                            <div className="no-assignees">
                                No testers assigned
                            </div>
                        )}
                    </div>
                </td>
                <td>
                    <div className="status-wrapper">{status}</div>
                    {isSignedIn && (
                        <div className="secondary-actions">
                            {isAdmin && nextReportStatus && (
                                <>
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            updateReportStatus(nextReportStatus)
                                        }
                                    >
                                        Mark as{' '}
                                        {capitalizeEachWord(nextReportStatus, {
                                            splitChar: '_'
                                        })}
                                    </Button>
                                    {nextReportStatus === 'Final' ? (
                                        <Button
                                            variant="link"
                                            className="mt-1"
                                            onClick={() =>
                                                updateReportStatus('DRAFT')
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
                    )}
                </td>
                <td className="actions">
                    <div className="test-cta-wrapper">
                        {currentUserAssigned && (
                            <Button
                                variant="primary"
                                href={`/run/${currentUserTestPlanRun.id}`}
                                disabled={!currentUserAssigned}
                            >
                                {currentUserTestPlanRun.testResults.length >
                                    0 &&
                                currentUserTestPlanRun.testResults.length <
                                    runnableTests.length
                                    ? 'Continue testing'
                                    : 'Start testing'}
                            </Button>
                        )}

                        {isAdmin && (
                            <Button
                                variant="danger"
                                onClick={() => {
                                    triggerDeleteTestPlanReportModal(
                                        testPlanReport.id,
                                        evaluateTestPlanRunTitle(),
                                        () => handleRemoveTestPlanReport()
                                    );
                                }}
                            >
                                Remove
                            </Button>
                        )}

                        {!isSignedIn && (
                            <Button
                                variant="primary"
                                href={`/test-plan-report/${testPlanReport.id}`}
                            >
                                View tests
                            </Button>
                        )}
                    </div>
                    {isSignedIn && (
                        <div className="secondary-actions">
                            {isAdmin && renderOpenAsDropdown()}
                            {isAdmin && renderDeleteMenu()}
                            {(!isAdmin &&
                                currentUserTestPlanRun.testResults &&
                                currentUserTestPlanRun.testResults.length && (
                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            triggerDeleteResultsModal(
                                                evaluateTestPlanRunTitle(),
                                                username,
                                                async () =>
                                                    await handleRemoveTesterResults(
                                                        currentUserTestPlanRun.id
                                                    )
                                            );
                                        }}
                                        aria-label="Delete my results"
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                        Delete Results
                                    </Button>
                                )) ||
                                null}

                            {alertMessage && (
                                <ATAlert
                                    key={`${testPlanVersion.id}-${testPlanVersion.gitSha}-${testPlanVersion.directory}`}
                                    message={alertMessage}
                                />
                            )}
                        </div>
                    )}
                </td>
            </tr>
            {showTestPlanUpdaterModal && (
                <TestPlanUpdaterModal
                    show={showTestPlanUpdaterModal}
                    handleClose={() => setShowTestPlanUpdaterModal(false)}
                    testPlanReportId={testPlanReportId}
                    triggerTestPlanReportUpdate={triggerTestPlanReportUpdate}
                />
            )}
        </>
    );
};

TestQueueRow.propTypes = {
    user: PropTypes.object,
    testers: PropTypes.array,
    testPlanReport: PropTypes.object,
    triggerDeleteTestPlanReportModal: PropTypes.func,
    triggerDeleteResultsModal: PropTypes.func,
    triggerTestPlanReportUpdate: PropTypes.func
};

export default TestQueueRow;
