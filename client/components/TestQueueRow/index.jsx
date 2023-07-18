import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useApolloClient, useMutation } from '@apollo/client';
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
import {
    TEST_PLAN_REPORT_QUERY,
    TEST_PLAN_REPORT_CANDIDATE_RECOMMENDED_QUERY,
    ASSIGN_TESTER_MUTATION,
    UPDATE_TEST_PLAN_REPORT_STATUS_MUTATION,
    REMOVE_TEST_PLAN_REPORT_MUTATION,
    REMOVE_TESTER_MUTATION,
    REMOVE_TESTER_RESULTS_MUTATION
} from '../TestQueue/queries';
import { gitUpdatedDateToString } from '../../utils/gitUtils';
import TestPlanUpdaterModal from '../TestPlanUpdater/TestPlanUpdaterModal';
import BasicThemedModal from '../common/BasicThemedModal';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import './TestQueueRow.css';
import CandidatePhaseSelectModal from '@components/TestQueueRow/CandidatePhaseSelectModal';

const TestQueueRow = ({
    user = {},
    testers = [],
    testPlanReportData = {},
    latestTestPlanVersions = [],
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

    const [candidatePhaseTestPlanReports, setCandidatePhaseTestPlanReports] =
        useState([]);
    const [alertMessage, setAlertMessage] = useState('');

    const [showThemedModal, setShowThemedModal] = useState(false);
    const [themedModalType, setThemedModalType] = useState('warning');
    const [themedModalTitle, setThemedModalTitle] = useState('');
    const [themedModalContent, setThemedModalContent] = useState(<></>);

    const [assignTester] = useMutation(ASSIGN_TESTER_MUTATION);
    const [updateTestPlanReportStatus] = useMutation(
        UPDATE_TEST_PLAN_REPORT_STATUS_MUTATION
    );
    const [removeTestPlanReport] = useMutation(
        REMOVE_TEST_PLAN_REPORT_MUTATION
    );
    const [removeTester] = useMutation(REMOVE_TESTER_MUTATION);
    const [removeTesterResults] = useMutation(REMOVE_TESTER_RESULTS_MUTATION);

    const [showTestPlanUpdaterModal, setShowTestPlanUpdaterModal] =
        useState(false);
    const [showCandidatePhaseSelectModal, setShowCandidatePhaseSelectModal] =
        useState(false);
    const [testPlanReport, setTestPlanReport] = useState(testPlanReportData);
    const [isLoading, setIsLoading] = useState(false);

    const { id, isAdmin, isTester, isVendor, username } = user;
    const {
        id: testPlanReportId,
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
            }, 'Updating Test Plan Assignees');
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
        const gitUpdatedDateString = (
            <p className="git-string">
                Published {gitUpdatedDateToString(testPlanVersion.updatedAt)}
            </p>
        );

        const latestTestPlanVersion = latestTestPlanVersions.filter(
            version => version.latestTestPlanVersion.id === testPlanVersion.id
        );
        const updateTestPlanVersionButton = isAdmin &&
            latestTestPlanVersion.length === 0 && (
                <Button
                    className="updater-button"
                    onClick={() => setShowTestPlanUpdaterModal(true)}
                    size="sm"
                    variant="secondary"
                >
                    Update Test Plan
                </Button>
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

        if (!isSignedIn || (isVendor && !isAdmin))
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
                        ref={dropdownAssignTesterButtonRef}
                        aria-label="Assign testers"
                        className="assign-tester"
                        variant="secondary"
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu role="menu">
                        {testers.length ? (
                            testers.map(({ username }) => {
                                const isTesterAssigned =
                                    checkIsTesterAssigned(username);
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
                                            focusButtonRef.current =
                                                dropdownAssignTesterButtonRef.current;
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

    const updateReportStatus = async status => {
        try {
            await triggerLoad(async () => {
                if (status === 'CANDIDATE') {
                    // Get list of testPlanReports which are already in CANDIDATE phase and check to see which
                    // is also the same pattern as what's being updated here to provide as a date option
                    const { data } = await client.query({
                        query: TEST_PLAN_REPORT_CANDIDATE_RECOMMENDED_QUERY,
                        fetchPolicy: 'network-only'
                    });

                    // TODO: Check to see if the proposed test plan report to be promoted to CANDIDATE
                    //  has a test plan version date less than whatever is in CANDIDATE or RECOMMENDED
                    //  tests already, if any, and note it may never be displayed to the admin

                    // --- SECTION START: OutdatedCandidatePhaseComparison
                    // Check to see if there are candidate test reports are already being compared
                    // which can never be shown in the test reports page as it currently is, so do
                    // not show it as an existing candidate phase option
                    const ignoredIds = [];

                    const directory = testPlanVersion.testPlan.directory;
                    const candidateReports = data.testPlanReports.filter(
                        r =>
                            r.status === 'CANDIDATE' &&
                            r.testPlanVersion.testPlan.directory === directory
                    );

                    const recommendedReports = data.testPlanReports.filter(
                        r =>
                            r.status === 'RECOMMENDED' &&
                            r.testPlanVersion.testPlan.directory === directory
                    );

                    recommendedReports.forEach(r => {
                        candidateReports.forEach(t => {
                            if (
                                !ignoredIds.includes(t.id) &&
                                t.at.id == r.at.id &&
                                t.browser.id == r.browser.id &&
                                t.testPlanVersion.testPlan.directory ==
                                    r.testPlanVersion.testPlan.directory &&
                                new Date(
                                    t.latestAtVersionReleasedAt.releasedAt
                                ) <
                                    new Date(
                                        r.latestAtVersionReleasedAt.releasedAt
                                    )
                            )
                                ignoredIds.push(t.id);
                        });
                    });

                    const filteredCandidateReports = candidateReports.filter(
                        t => !ignoredIds.includes(t.id)
                    );
                    // --- SECTION END: OutdatedCandidatePhaseComparison

                    const dates = filteredCandidateReports
                        .map(c => {
                            return {
                                candidateStatusReachedAt:
                                    c.candidateStatusReachedAt,
                                recommendedStatusTargetDate:
                                    c.recommendedStatusTargetDate
                            };
                        })
                        // Sort in descending order of dates (top is the latest date the existing
                        // candidate report status was reached at)
                        .sort((a, b) =>
                            new Date(a.candidateStatusReachedAt) >
                            new Date(b.candidateStatusReachedAt)
                                ? -1
                                : 1
                        );

                    const stringifiedDates = dates.map(d => JSON.stringify(d));
                    const uniq = [...new Set(stringifiedDates)];
                    const candidatePhaseList = uniq.map(u => JSON.parse(u));
                    setCandidatePhaseTestPlanReports(candidatePhaseList);

                    if (candidatePhaseList.length > 0) {
                        // There already exists a Test Plan Report which uses this pattern so
                        // there is already a candidate phase to select from
                        setShowCandidatePhaseSelectModal(true);
                    } else {
                        await updateTestPlanReportStatus({
                            variables: {
                                testReportId: testPlanReport.id,
                                status: status
                            }
                        });
                        await triggerPageUpdate();
                    }
                } else {
                    // Create a new candidate phase since no others exist
                    await updateTestPlanReportStatus({
                        variables: {
                            testReportId: testPlanReport.id,
                            status: status
                        }
                    });
                    await triggerTestPlanReportUpdate();
                }
            }, 'Updating Test Plan Status');
        } catch (e) {
            showThemedMessage(
                'Error Updating Test Plan Status',
                <>{e.message}</>,
                'warning'
            );
        }
    };

    const evaluateStatusAndResults = () => {
        const { status: runStatus, conflictsLength } = testPlanReport;

        let status, results;

        if (isLoading) {
            status = (
                <span className="status-label not-started">Loading ...</span>
            );
        } else if (conflictsLength > 0) {
            let pluralizedStatus = `${conflictsLength} Conflict${
                conflictsLength === 1 ? '' : 's'
            }`;
            status = (
                <span className="status-label conflicts">
                    {pluralizedStatus}
                </span>
            );
        } else if (runStatus === 'DRAFT' || !runStatus) {
            status = <span className="status-label not-started">Draft</span>;
        }

        return { status, results };
    };

    const evaluateNewReportStatus = () => {
        const { conflictsLength } = testPlanReport;

        // If the results have been marked as draft and there is no conflict,
        // they can be marked as "CANDIDATE"

        if (conflictsLength === 0 && testPlanRunsWithResults.length > 0) {
            return 'CANDIDATE';
        }

        return null;
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

    const onHandleCandidatePhaseSelectModalAction = async date => {
        let variables = {};

        if (date) {
            const { candidateStatusReachedAt, recommendedStatusTargetDate } =
                date;
            variables = {
                candidateStatusReachedAt,
                recommendedStatusTargetDate
            };
        }

        // Null 'date' if candidate phase is to be created; promote to candidate phase as normal
        try {
            await triggerLoad(async () => {
                setShowCandidatePhaseSelectModal(false);
                await updateTestPlanReportStatus({
                    variables: {
                        testReportId: testPlanReport.id,
                        status: 'CANDIDATE',
                        ...variables
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

    const onCandidatePhaseSelectModalClose = () => {
        setShowCandidatePhaseSelectModal(false);
        focusButtonRef.current.focus();
    };

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
                                        : 'Unassign Yourself'}
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
                                    .map(
                                        ({ tester, testResultsLength = 0 }) => (
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
                                                    {`${testResultsLength} of ${runnableTestsLength} tests complete`}
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
                    {isSignedIn && isTester && (
                        <div className="secondary-actions">
                            {isAdmin && !isLoading && nextReportStatus && (
                                <>
                                    <Button
                                        ref={updateTestPlanStatusButtonRef}
                                        variant="secondary"
                                        onClick={async () => {
                                            focusButtonRef.current =
                                                updateTestPlanStatusButtonRef.current;
                                            await updateReportStatus(
                                                nextReportStatus
                                            );
                                        }}
                                    >
                                        Mark as{' '}
                                        {capitalizeEachWord(nextReportStatus, {
                                            splitChar: '_'
                                        })}
                                    </Button>
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
                                currentUserTestPlanRun.testResultsLength && (
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
            {showCandidatePhaseSelectModal && (
                <CandidatePhaseSelectModal
                    show={showCandidatePhaseSelectModal}
                    title={`Select existing Candidate Phase for the ${testPlanVersion.title}, ${testPlanReport.at?.name} & ${testPlanReport.browser?.name} Test Plan Report`}
                    dates={candidatePhaseTestPlanReports}
                    handleAction={onHandleCandidatePhaseSelectModalAction}
                    handleClose={onCandidatePhaseSelectModalClose}
                />
            )}
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
