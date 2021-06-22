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
