import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useApolloClient, useMutation } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import nextId from 'react-id-generator';
import { Form, Button, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
    TEST_PLAN_REPORT_QUERY,
    ASSIGN_TESTER_MUTATION,
    MARK_TEST_PLAN_REPORT_AS_FINAL_MUTATION,
    REMOVE_TEST_PLAN_REPORT_MUTATION,
    REMOVE_TESTER_MUTATION,
    REMOVE_TESTER_RESULTS_MUTATION
} from '../TestQueue/queries';
import BasicModal from '../common/BasicModal';
import BasicThemedModal from '../common/BasicThemedModal';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import './TestQueueRow.css';
import { useAriaLiveRegion } from '../providers/AriaLiveRegionProvider';
import TestQueueCompletionStatusListItem from '../TestQueueCompletionStatusListItem';
import { isBot } from '../../utils/automation';
import AssignTesterDropdown from '../TestQueue/AssignTesterDropdown';
import BotRunTestStatusList from '../BotRunTestStatusList';
import ManageBotRunDialogWithButton from '../ManageBotRunDialog/WithButton';

const TestQueueRow = ({
    user = {},
    testers = [],
    testPlanReportData = {},
    triggerDeleteTestPlanReportModal = () => {},
    triggerDeleteResultsModal = () => {},
    triggerPageUpdate = () => {}
}) => {
    const client = useApolloClient();
    const { triggerLoad, loadingMessage } = useTriggerLoad();

    const focusButtonRef = useRef();
    const dropdownAssignTesterButtonRef = useRef();
    const assignTesterButtonRef = useRef();
    const dropdownDeleteTesterResultsButtonRef = useRef();
    const deleteTesterResultsButtonRef = useRef();
    const deleteTestPlanButtonRef = useRef();
    const updateTestPlanStatusButtonRef = useRef();

    const setAlertMessage = useAriaLiveRegion();

    const [showPrimaryTestPlanRunModal, setShowPrimaryTestPlanRunModal] =
        useState(false);
    const [showThemedModal, setShowThemedModal] = useState(false);
    const [themedModalType, setThemedModalType] = useState('warning');
    const [themedModalTitle, setThemedModalTitle] = useState('');
    const [themedModalContent, setThemedModalContent] = useState(<></>);

    const [assignTester] = useMutation(ASSIGN_TESTER_MUTATION);
    const [markTestPlanReportAsFinal] = useMutation(
        MARK_TEST_PLAN_REPORT_AS_FINAL_MUTATION
    );
    const [removeTestPlanReport] = useMutation(
        REMOVE_TEST_PLAN_REPORT_MUTATION
    );
    const [removeTester] = useMutation(REMOVE_TESTER_MUTATION);
    const [removeTesterResults] = useMutation(REMOVE_TESTER_RESULTS_MUTATION);

    const [testPlanReport, setTestPlanReport] = useState(testPlanReportData);
    const [primaryTestPlanRunId, setPrimaryTestPlanRunId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { id, isAdmin, isTester, isVendor, username } = user;
    const {
        testPlanVersion,
        draftTestPlanRuns,
        runnableTestsLength = 0
    } = testPlanReport;

    const isSignedIn = !!id;

    useEffect(() => {
        setTestPlanReport(testPlanReportData);
    }, [testPlanReportData]);

    const checkIsTesterAssigned = username => {
        return draftTestPlanRuns.some(
            testPlanRun => testPlanRun.tester.username === username && isTester
        );
    };

    const currentUserAssigned = checkIsTesterAssigned(username);
    const currentUserTestPlanRun = currentUserAssigned
        ? draftTestPlanRuns.find(({ tester }) => tester.username === username)
        : {};

    const testPlanRunsWithResults = draftTestPlanRuns.filter(
        ({ testResultsLength = 0 }) => testResultsLength > 0
    );

    const primaryTestPlanRunOptions = draftTestPlanRuns
        .slice()
        .sort((a, b) =>
            a.tester.username.toLowerCase() < b.tester.username.toLowerCase()
                ? -1
                : 1
        )
        .map(run => ({
            testPlanRunId: run.id,
            ...run.tester
        }))
        .filter(tester => !isBot(tester));

    const getTestPlanRunIdByUserId = userId => {
        return draftTestPlanRuns.find(({ tester }) => tester.id === userId).id;
    };

    const triggerTestPlanReportUpdate = async (id = testPlanReport.id) => {
        setIsLoading(true);
        const { data } = await client.query({
            query: TEST_PLAN_REPORT_QUERY,
            variables: { testPlanReportId: id },
            fetchPolicy: 'network-only'
        });
        setTestPlanReport(data.testPlanReport);
        setIsLoading(false);
    };

    const toggleTesterAssign = async username => {
        const isTesterAssigned = checkIsTesterAssigned(username);
        const tester = testers.find(tester => tester.username === username);

        if (isTesterAssigned) {
            await triggerLoad(async () => {
                await removeTester({
                    variables: {
                        testReportId: testPlanReport.id,
                        testerId: tester.id
                    }
                });
                await triggerTestPlanReportUpdate();
            }, `Updating Test Plan Assignees. Deleting Test Plan Run for ${tester.username}`);
        } else {
            await triggerLoad(async () => {
                await assignTester({
                    variables: {
                        testReportId: testPlanReport.id,
                        testerId: tester.id
                    }
                });
                await triggerTestPlanReportUpdate();
            }, 'Updating Test Plan Assignees');
        }

        if (focusButtonRef.current) focusButtonRef.current.focus();
    };

    const handleRemoveTestPlanReport = async () => {
        await removeTestPlanReport({
            variables: {
                testReportId: testPlanReport.id
            }
        });
        await triggerPageUpdate();
    };

    const handleRemoveTesterResults = async testPlanRunId => {
        await removeTesterResults({
            variables: {
                testPlanRunId
            }
        });
        await triggerTestPlanReportUpdate();
    };

    const showThemedMessage = (title, content, theme) => {
        setThemedModalTitle(title);
        setThemedModalContent(content);
        setThemedModalType(theme);
        setShowThemedModal(true);
    };

    const onThemedModalClose = () => {
        setShowThemedModal(false);
        focusButtonRef.current.focus();
    };

    const renderAssignedUserToTestPlan = () => {
        const titleElement = (
            <>
                {testPlanVersion.title} {testPlanVersion.versionString}
                &nbsp;({runnableTestsLength} Test
                {runnableTestsLength === 0 || runnableTestsLength > 1
                    ? `s`
                    : ''}
                )
            </>
        );

        // Determine if current user is assigned to testPlan
        if (currentUserAssigned)
            return (
                <>
                    <Link
                        className="test-plan"
                        to={`/run/${currentUserTestPlanRun.id}`}
                    >
                        {titleElement}
                    </Link>
                </>
            );

        if (!isSignedIn || (isVendor && !isAdmin))
            return (
                <>
                    <Link to={`/test-plan-report/${testPlanReport.id}`}>
                        {titleElement}
                    </Link>
                </>
            );

        return <div>{titleElement}</div>;
    };

    const renderAssignMenu = () => {
        return (
            <AssignTesterDropdown
                onChange={async () => {
                    focusButtonRef.current =
                        dropdownAssignTesterButtonRef.current;
                    await triggerTestPlanReportUpdate();
                }}
                setAlertMessage={setAlertMessage}
                testPlanReportId={testPlanReport.id}
                possibleTesters={testers}
                draftTestPlanRuns={draftTestPlanRuns}
                dropdownAssignTesterButtonRef={dropdownAssignTesterButtonRef}
            />
        );
    };

    const evaluateTestPlanRunTitle = () => {
        const { title: apgExampleName, directory } = testPlanVersion;
        const testPlanTargetTitle = `${testPlanReport.at?.name} and ${testPlanReport.browser?.name}`;

        return `${apgExampleName || directory} for ${testPlanTargetTitle}`;
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
                    {draftTestPlanRuns
                        .slice() // because array was frozen
                        .sort((a, b) =>
                            a.tester.username < b.tester.username ? -1 : 1
                        )
                        .map(({ tester }) => {
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
                        <Dropdown.Toggle
                            ref={dropdownDeleteTesterResultsButtonRef}
                            variant="danger"
                        >
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
                                                async () => {
                                                    await triggerLoad(
                                                        async () => {
                                                            await handleRemoveTesterResults(
                                                                id
                                                            );
                                                        },
                                                        'Removing Test Results'
                                                    );
                                                    dropdownDeleteTesterResultsButtonRef.current.focus();
                                                }
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

    const renderSecondaryActions = () => {
        const botTestPlanRun = draftTestPlanRuns.find(({ tester }) =>
            isBot(tester)
        );

        if (isAdmin && !isLoading) {
            return (
                <>
                    {botTestPlanRun && (
                        <ManageBotRunDialogWithButton
                            testPlanRun={botTestPlanRun}
                            testPlanReportId={testPlanReport.id}
                            runnableTestsLength={runnableTestsLength}
                            testers={testers}
                            onChange={triggerTestPlanReportUpdate}
                            onDelete={() => {
                                triggerDeleteResultsModal(
                                    evaluateTestPlanRunTitle(),
                                    botTestPlanRun.tester.username,
                                    async () => {
                                        await triggerLoad(async () => {
                                            await handleRemoveTesterResults(
                                                botTestPlanRun.id
                                            );
                                        }, 'Removing Test Results');
                                        dropdownDeleteTesterResultsButtonRef.current.focus();
                                    }
                                );
                            }}
                        />
                    )}
                    {!testPlanReport.conflictsLength &&
                        testPlanReport.draftTestPlanRuns.length > 0 &&
                        testPlanReport.draftTestPlanRuns[0].testResultsLength >
                            0 &&
                        completedAllTests && (
                            <Button
                                ref={updateTestPlanStatusButtonRef}
                                variant="secondary"
                                onClick={() => {
                                    focusButtonRef.current =
                                        updateTestPlanStatusButtonRef.current;
                                    setPrimaryTestPlanRunId(
                                        primaryTestPlanRunOptions[0]
                                            .testPlanRunId
                                    );
                                    setShowPrimaryTestPlanRunModal(true);
                                }}
                            >
                                Mark as Final
                            </Button>
                        )}
                    {botTestPlanRun && (
                        <BotRunTestStatusList
                            testPlanReportId={testPlanReport.id}
                            runnableTestsLength={runnableTestsLength}
                        />
                    )}
                </>
            );
        }
    };

    const handlePrimaryTestRunChange = e => {
        const value = e.target.value;
        setPrimaryTestPlanRunId(value);
    };

    const renderPrimaryRunSelectionDialog = testers => {
        return (
            <BasicModal
                show={showPrimaryTestPlanRunModal}
                title="Select Primary Test Plan Run"
                content={
                    <>
                        When a tester&apos;s run is marked as primary, it means
                        that their output for collected results will be
                        prioritised and shown on report pages.
                        <br />
                        A tester&apos;s run being marked as primary may also set
                        the minimum required Assistive Technology Version that
                        can be used for subsequent reports with that Test Plan
                        Version and Assistive Technology combination.
                        <br />
                        <br />
                        <Form.Select
                            className="primary-test-run-select"
                            defaultValue={primaryTestPlanRunId}
                            onChange={handlePrimaryTestRunChange}
                            htmlSize={testers.length}
                        >
                            {testers.map(tester => (
                                <option
                                    key={`${testPlanReport.id}-${tester.id}`}
                                    value={tester.testPlanRunId}
                                >
                                    {tester.username}
                                </option>
                            ))}
                        </Form.Select>
                    </>
                }
                closeLabel="Cancel"
                staticBackdrop={true}
                actions={[
                    {
                        label: 'Confirm',
                        onClick: async () => await updateReportMarkedFinal()
                    }
                ]}
                useOnHide
                handleClose={() => {
                    setPrimaryTestPlanRunId(null);
                    setShowPrimaryTestPlanRunModal(false);
                }}
            />
        );
    };

    const updateReportMarkedFinal = async () => {
        try {
            await triggerLoad(async () => {
                await markTestPlanReportAsFinal({
                    variables: {
                        testReportId: testPlanReport.id,
                        primaryTestPlanRunId
                    }
                });
                await triggerPageUpdate();
            }, 'Updating Test Plan Status');
        } catch (e) {
            showThemedMessage(
                'Error Updating Test Plan Status',
                <>{e.message}</>,
                'warning'
            );
        }
    };

    const evaluateLabelStatus = () => {
        const { conflictsLength } = testPlanReport;

        let labelStatus;

        if (isLoading) {
            labelStatus = (
                <span className="status-label not-started">Loading ...</span>
            );
        } else if (conflictsLength > 0) {
            let pluralizedStatus = `${conflictsLength} Conflict${
                conflictsLength === 1 ? '' : 's'
            }`;
            labelStatus = (
                <span className="status-label conflicts">
                    {pluralizedStatus}
                </span>
            );
        } else {
            labelStatus = (
                <span className="status-label not-started">Draft</span>
            );
        }

        return labelStatus;
    };

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

    const completedAllTests = testPlanReport.draftTestPlanRuns.every(
        testPlanRun =>
            testPlanRun.testResultsLength === testPlanReport.runnableTestsLength
    );

    return (
        <LoadingStatus message={loadingMessage}>
            <tr className="test-queue-run-row">
                <th>{renderAssignedUserToTestPlan()}</th>
                <td>
                    {isSignedIn && isTester && (
                        <div className="testers-wrapper">
                            {isAdmin && renderAssignMenu()}
                            <div className="assign-actions">
                                <Button
                                    ref={assignTesterButtonRef}
                                    variant="secondary"
                                    onClick={async () => {
                                        focusButtonRef.current =
                                            assignTesterButtonRef.current;
                                        await toggleTesterAssign(username);
                                    }}
                                    className="assign-self"
                                >
                                    {!currentUserAssigned
                                        ? 'Assign Yourself'
                                        : 'Delete your test plan run'}
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className={(isSignedIn && 'secondary-actions') || ''}>
                        {draftTestPlanRuns.length !== 0 ? (
                            <ul className="assignees">
                                {draftTestPlanRuns
                                    .slice() // because array was frozen
                                    .sort((a, b) =>
                                        a.tester.username < b.tester.username
                                            ? -1
                                            : 1
                                    )
                                    .map(draftTestPlanRun => (
                                        <TestQueueCompletionStatusListItem
                                            key={nextId()}
                                            runnableTestsLength={
                                                runnableTestsLength
                                            }
                                            testPlanRun={draftTestPlanRun}
                                            id={getRowId(
                                                draftTestPlanRun.tester
                                            )}
                                        />
                                    ))}
                            </ul>
                        ) : (
                            <div className="no-assignees">
                                No testers assigned
                            </div>
                        )}
                    </div>
                </td>
                <td>
                    <div className="status-wrapper">
                        {evaluateLabelStatus()}
                    </div>
                    {isSignedIn && isTester && (
                        <div className="secondary-actions">
                            {renderSecondaryActions()}
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
                                {currentUserTestPlanRun.testResultsLength > 0 &&
                                currentUserTestPlanRun.testResultsLength <
                                    runnableTestsLength
                                    ? 'Continue testing'
                                    : 'Start testing'}
                            </Button>
                        )}

                        {isAdmin && (
                            <Button
                                ref={deleteTestPlanButtonRef}
                                variant="danger"
                                onClick={() => {
                                    triggerDeleteTestPlanReportModal(
                                        testPlanReport.id,
                                        evaluateTestPlanRunTitle(),
                                        async () => {
                                            await triggerLoad(async () => {
                                                await handleRemoveTestPlanReport();
                                            }, 'Removing Test Plan');
                                            deleteTestPlanButtonRef.current.focus();
                                        }
                                    );
                                }}
                            >
                                Remove
                            </Button>
                        )}

                        {(!isSignedIn || (isVendor && !isAdmin)) && (
                            <Button
                                variant="primary"
                                href={`/test-plan-report/${testPlanReport.id}`}
                            >
                                View tests
                            </Button>
                        )}
                    </div>
                    {isSignedIn && isTester && (
                        <div className="secondary-actions">
                            {isAdmin && renderOpenAsDropdown()}
                            {isAdmin && renderDeleteMenu()}
                            {(!isAdmin &&
                                currentUserTestPlanRun.testResultsLength >
                                    0 && (
                                    <Button
                                        ref={deleteTesterResultsButtonRef}
                                        variant="danger"
                                        onClick={() => {
                                            triggerDeleteResultsModal(
                                                evaluateTestPlanRunTitle(),
                                                username,
                                                async () => {
                                                    await triggerLoad(
                                                        async () => {
                                                            await handleRemoveTesterResults(
                                                                currentUserTestPlanRun.id
                                                            );
                                                        },
                                                        'Removing Test Results'
                                                    );
                                                    deleteTesterResultsButtonRef.current.focus();
                                                }
                                            );
                                        }}
                                        aria-label="Delete my results"
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                        Delete Results
                                    </Button>
                                )) ||
                                null}
                        </div>
                    )}
                </td>
            </tr>

            {showThemedModal && (
                <BasicThemedModal
                    show={showThemedModal}
                    theme={themedModalType}
                    title={themedModalTitle}
                    dialogClassName="modal-50w"
                    content={themedModalContent}
                    actionButtons={[
                        {
                            text: 'Ok',
                            action: onThemedModalClose
                        }
                    ]}
                    handleClose={onThemedModalClose}
                    showCloseAction={false}
                />
            )}
            {showPrimaryTestPlanRunModal &&
                renderPrimaryRunSelectionDialog(primaryTestPlanRunOptions)}
        </LoadingStatus>
    );
};

TestQueueRow.propTypes = {
    user: PropTypes.object,
    testers: PropTypes.array,
    isConflictsLoading: PropTypes.bool,
    testPlanReportData: PropTypes.object,
    latestTestPlanVersions: PropTypes.array,
    triggerDeleteTestPlanReportModal: PropTypes.func,
    triggerDeleteResultsModal: PropTypes.func,
    triggerPageUpdate: PropTypes.func
};

export default TestQueueRow;
