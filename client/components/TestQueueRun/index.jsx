import React, { useRef, useState } from 'react';
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

import './TestQueueRun.css';
import {
    ASSIGN_TESTER_MUTATION,
    REMOVE_TESTER_MUTATION,
    REMOVE_TESTER_RESULTS_MUTATION,
    UPDATE_TEST_PLAN_REPORT_MUTATION
} from '../TestQueue/queries';

const TestQueueRun = ({
    user = {},
    testers = [],
    testPlanReport = {},
    triggerDeleteTestPlanReportModal = () => {},
    triggerDeleteResultsModal = () => {},
    triggerTestPlanReportUpdate = () => {}
}) => {
    const startTestingButtonRef = useRef();
    const [alertMessage, setAlertMessage] = useState('');

    const [assignTester] = useMutation(ASSIGN_TESTER_MUTATION);
    const [removeTester] = useMutation(REMOVE_TESTER_MUTATION);
    const [removeTesterResults] = useMutation(REMOVE_TESTER_RESULTS_MUTATION);
    const [updateTestPlanReportStatus] = useMutation(
        UPDATE_TEST_PLAN_REPORT_MUTATION
    );

    const { isAdmin, username } = user;

    const checkIsTesterAssigned = username => {
        return testPlanReport.draftTestPlanRuns.some(
            testPlanRun => testPlanRun.tester.username === username
        );
    };

    const currentUserAssigned = checkIsTesterAssigned(user.username);
    const currentUserTestPlanRun = currentUserAssigned
        ? testPlanReport.draftTestPlanRuns.find(
              testPlanRun => testPlanRun.tester.username === user.username
          )
        : {};
    const testPlanRunTesters = testPlanReport.draftTestPlanRuns;

    const getTestPlanRunsWithResults = () => {
        const { draftTestPlanRuns } = testPlanReport;
        return draftTestPlanRuns.filter(
            testPlanRun => testPlanRun.testResultCount > 0
        );
    };

    const getTestPlanRunIdByUserId = userId => {
        const { draftTestPlanRuns } = testPlanReport;
        return draftTestPlanRuns.find(
            testPlanRun => testPlanRun.tester.id === userId
        ).id;
    };

    const toggleTesterAssign = async username => {
        const isTesterAssigned = checkIsTesterAssigned(username);
        const tester = testers.find(tester => tester.username === username);

        if (isTesterAssigned) {
            // unassign tester
            await removeTester({
                variables: {
                    testReportId: testPlanReport.id,
                    testerId: tester.id
                }
            });
        } else {
            // assign tester
            await assignTester({
                variables: {
                    testReportId: testPlanReport.id,
                    testerId: tester.id
                }
            });
        }

        // force data after assignment changes
        await triggerTestPlanReportUpdate();
    };

    const handleRemoveTestPlanReport = async () => {
        await updateReportStatus('REMOVED');

        // force data after assignment changes
        await triggerTestPlanReportUpdate();
    };

    const handleRemoveTesterResults = async tester => {
        const { id: testReportId } = testPlanReport;
        const { id: testerId } = tester;

        await removeTesterResults({
            variables: {
                testReportId,
                testerId
            }
        });

        // force data after assignment changes
        await triggerTestPlanReportUpdate();
    };

    const renderAssignedUserToTestPlan = () => {
        // Determine if current user is assigned to testPlan
        if (currentUserAssigned)
            return (
                <Link to={`/run/${currentUserTestPlanRun.id}`}>
                    {testPlanReport.testPlanVersion.title ||
                        `"${testPlanReport.testPlanVersion.directory}"`}
                </Link>
            );
        return (
            testPlanReport.testPlanVersion.title ||
            `"${testPlanReport.testPlanVersion.directory}"`
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
                    <Dropdown.Menu>
                        {testers.length ? (
                            testers.map(tester => {
                                const isTesterAssigned = checkIsTesterAssigned(
                                    tester.username
                                );
                                let classname = isTesterAssigned
                                    ? 'assigned'
                                    : 'not-assigned';
                                return (
                                    <Dropdown.Item
                                        variant="secondary"
                                        as="button"
                                        key={nextId()}
                                        onClick={async () => {
                                            await toggleTesterAssign(
                                                tester.username
                                            );
                                            setAlertMessage(
                                                `You have been ${
                                                    classname.includes('not')
                                                        ? 'removed from'
                                                        : 'assigned to'
                                                } this test run.`
                                            );
                                        }}
                                        aria-checked={isTesterAssigned}
                                        role="menuitemcheckbox"
                                    >
                                        {isTesterAssigned && (
                                            <FontAwesomeIcon icon={faCheck} />
                                        )}
                                        <span className={classname}>
                                            {`${tester.username}`}
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

    const evaluateTestRunTitle = () => {
        const { testPlanTarget, testPlanVersion } = testPlanReport;
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
                                href={`/run/${getTestPlanRunIdByUserId(
                                    t.tester.id
                                )}?user=${t.tester.id}`}
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
                                            triggerDeleteResultsModal(
                                                evaluateTestRunTitle(),
                                                t.tester.username,
                                                async () =>
                                                    await handleRemoveTesterResults(
                                                        t.tester
                                                    )
                                            );
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

    const evaluateNewReportStatus = () => {
        const { status, conflictCount = 0 } = testPlanReport;
        const testersWithResults = getTestPlanRunsWithResults();

        // If there are no conflicts OR the test has been marked as "final",
        // and admin can mark a test run as "draft"
        let newStatus;
        if (
            (status !== 'IN_REVIEW' &&
                conflictCount === 0 &&
                testersWithResults.length > 0) ||
            status === 'FINALIZED'
        ) {
            newStatus = 'IN_REVIEW';
        }
        // If the results have been marked as draft and there is no conflict,
        // they can be marked as "final"
        else if (
            status === 'IN_REVIEW' &&
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
        <tr className="test-queue-run-row">
            <td>{renderAssignedUserToTestPlan()}</td>
            <td>
                <div className="testers-wrapper">
                    {isAdmin && renderAssignMenu()}
                    <div className="assign-actions">
                        {!currentUserAssigned && (
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    toggleTesterAssign(user.username)
                                }
                                aria-label={`Assign yourself to the test run ${evaluateTestRunTitle()}`}
                                className="assign-self"
                            >
                                Assign Yourself
                            </Button>
                        )}
                        {currentUserAssigned && (
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    toggleTesterAssign(user.username)
                                }
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
                                        {`(${testPlanRun.testResultCount} of ${testPlanRun.testResults.length} tests complete)`}
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
                <div className="test-cta-wrapper">
                    {currentUserAssigned && (
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
                    )}

                    {isAdmin && (
                        <Button
                            variant="danger"
                            onClick={() => {
                                triggerDeleteTestPlanReportModal(
                                    testPlanReport.id,
                                    evaluateTestRunTitle(),
                                    async () =>
                                        await handleRemoveTestPlanReport(
                                            testPlanReport
                                        )
                                );
                            }}
                        >
                            Remove
                        </Button>
                    )}
                </div>
                <div className="secondary-actions">
                    {isAdmin && renderOpenAsDropdown()}
                    {isAdmin && renderDeleteMenu()}
                    {(!isAdmin && currentUserTestPlanRun.testResultCount && (
                        <Button
                            variant="danger"
                            onClick={() => {
                                triggerDeleteResultsModal(
                                    evaluateTestRunTitle(),
                                    username,
                                    async () =>
                                        await handleRemoveTesterResults(user)
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
                            key={`${testPlanReport.testPlanVersion.id}-${testPlanReport.testPlanVersion.gitSha}-${testPlanReport.testPlanVersion.directory}`}
                            message={alertMessage}
                        />
                    )}
                </div>
            </td>
        </tr>
    );
};

TestQueueRun.propTypes = {
    user: PropTypes.object,
    testers: PropTypes.array,
    testPlanReport: PropTypes.object,
    triggerDeleteTestPlanReportModal: PropTypes.func,
    triggerDeleteResultsModal: PropTypes.func,
    triggerTestPlanReportUpdate: PropTypes.func
};

export default TestQueueRun;
