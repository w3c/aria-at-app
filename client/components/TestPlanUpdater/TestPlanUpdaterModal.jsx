import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useApolloClient } from '@apollo/client';
import { Alert, Modal, Button, Form } from 'react-bootstrap';
import { gitUpdatedDateToString } from '../../utils/gitUtils';
import hash from 'object-hash';
import { omit } from 'lodash';
import {
    CREATE_TEST_PLAN_REPORT_MUTATION,
    CREATE_TEST_PLAN_RUN_MUTATION,
    CREATE_TEST_RESULT_MUTATION,
    DELETE_TEST_PLAN_REPORT,
    SAVE_TEST_RESULT_MUTATION,
    SUBMIT_TEST_RESULT_MUTATION,
    TEST_PLAN_ID_QUERY,
    UPDATER_QUERY,
    VERSION_QUERY
} from './queries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './TestPlanUpdaterModal.css';
import '../TestRun/TestRun.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const toSentence = array => {
    // https://stackoverflow.com/a/24376930/3888572
    return array.join(', ').replace(/,\s([^,]+)$/, ' and $1');
};

const TestPlanUpdaterModal = ({
    show,
    handleClose,
    testPlanReportId,
    triggerTestPlanReportUpdate
}) => {
    const loadInitialData = async ({
        client,
        setUpdaterData,
        testPlanReportId
    }) => {
        if (!testPlanReportId) throw new Error('No id found in URL');

        const { data: testPlanIdData } = await client.query({
            query: TEST_PLAN_ID_QUERY,
            variables: { testPlanReportId }
        });
        const testPlanId =
            testPlanIdData?.testPlanReport?.testPlanVersion?.testPlan?.id;

        if (!testPlanId)
            throw new Error(
                `Could not find test plan report with id "${testPlanReportId}"`
            );

        const { data: updaterData } = await client.query({
            query: UPDATER_QUERY,
            variables: { testPlanReportId, testPlanId }
        });
        setUpdaterData(updaterData);
    };

    const compareTestContent = (currentTests, newTests) => {
        const hashTest = test => hash(omit(test, ['id']));
        const hashTests = tests => {
            return Object.fromEntries(
                tests.map(test => [hashTest(test), test])
            );
        };

        const currentTestsByHash = hashTests(currentTests);
        const newTestsByHash = hashTests(newTests);

        const testsToDelete = [];
        const currentTestIdsToNewTestIds = {};
        Object.entries(currentTestsByHash).forEach(([hash, currentTest]) => {
            const newTest = newTestsByHash[hash];
            if (!newTest) {
                testsToDelete.push(currentTest);
                return;
            }
            currentTestIdsToNewTestIds[currentTest.id] = newTest.id;
        });

        return { testsToDelete, currentTestIdsToNewTestIds };
    };

    const client = useApolloClient();
    const [updaterData, setUpdaterData] = useState();
    const [versionData, setVersionData] = useState();
    const [safeToDeleteReportId, setSafeToDeleteReportId] = useState();
    const [showModalData, setShowModalData] = useState(true);
    const [loadingSpinnerProgress, setLoadingSpinnerProgress] = useState({
        visible: false,
        numerator: null,
        denominator: null
    });
    const [alertCompletion, setAlertCompletion] = useState({
        message: null,
        success: false,
        visible: false
    });
    const [deleteChecked, setDeleteChecked] = useState(true);
    const [newReport, setNewReport] = useState(false);

    useEffect(() => {
        loadInitialData({ client, setUpdaterData, testPlanReportId });
    }, []);

    if (!updaterData) {
        return (
            <Modal show={show} onHide={handleClose} dialogClassName="modal-90w">
                <Modal.Header closeButton className="test-plan-updater-header">
                    <Modal.Title>Test Plan Updater</Modal.Title>
                </Modal.Header>
                <LoadingSpinner className="loading-spinner" />
            </Modal>
        );
    }

    const {
        testPlanReport: {
            id: currentReportId,
            testPlanTarget: {
                at: { id: atId, name: atName },
                atVersion,
                browser: { id: browserId, name: browserName },
                browserVersion
            },
            testPlanVersion: currentVersion
        },
        testPlan: { testPlanVersions }
    } = updaterData;

    const latestVersions = testPlanVersions.filter(
        version => version.updatedAt >= currentVersion.updatedAt
    );

    const selectVersion = async event => {
        const testPlanVersionId = event.target.value;
        if (testPlanVersionId === 'unselected') {
            setVersionData(null);
            return;
        }

        const { data: versionData } = await client.query({
            query: VERSION_QUERY,
            variables: {
                testPlanReportId: currentReportId,
                testPlanVersionId,
                atId
            }
        });
        setVersionData(versionData);
    };

    const newTestPlanVersionId = versionData?.testPlanVersion.id;
    let runsWithResults;
    let allTestResults;
    let copyableTestResults;
    let testsToDelete;
    let currentTestIdsToNewTestIds;
    if (versionData) {
        const { testPlanReport, testPlanVersion } = versionData;
        runsWithResults = testPlanReport.draftTestPlanRuns.filter(
            testPlanRun => testPlanRun.testResults.length
        );
        allTestResults = runsWithResults.flatMap(
            testPlanRun => testPlanRun.testResults
        );

        ({ testsToDelete, currentTestIdsToNewTestIds } = compareTestContent(
            allTestResults.map(testResult => testResult.test),
            testPlanVersion.tests
        ));

        copyableTestResults = allTestResults.filter(
            testResult => currentTestIdsToNewTestIds[testResult.test.id]
        );
    }

    const canCreateNewReport = versionData && runsWithResults.length > 0;

    const copyTestResult = (testResultSkeleton, testResult) => {
        return {
            id: testResultSkeleton.id,
            scenarioResults: testResultSkeleton.scenarioResults.map(
                (scenarioResultSkeleton, index) => {
                    const scenarioResult = testResult.scenarioResults[index];
                    return {
                        id: scenarioResultSkeleton.id,
                        output: scenarioResult.output,
                        assertionResults: scenarioResultSkeleton.assertionResults.map(
                            (assertionResultSkeleton, assertionResultIndex) => {
                                const assertionResult =
                                    scenarioResult.assertionResults[
                                        assertionResultIndex
                                    ];
                                return {
                                    id: assertionResultSkeleton.id,
                                    passed: assertionResult.passed,
                                    failedReason: assertionResult.failedReason
                                };
                            }
                        ),
                        unexpectedBehaviors: scenarioResult.unexpectedBehaviors
                    };
                }
            )
        };
    };

    const createNewReportWithData = async () => {
        setShowModalData(false);
        const { data: newReportData } = await client.mutate({
            mutation: CREATE_TEST_PLAN_REPORT_MUTATION,
            variables: {
                input: {
                    testPlanVersionId: newTestPlanVersionId,
                    testPlanTarget: {
                        atId: atId,
                        atVersion: atVersion,
                        browserId: browserId,
                        browserVersion: browserVersion
                    }
                }
            }
        });

        const {
            testPlanReport: { id: newReportId }
        } = newReportData.findOrCreateTestPlanReport.populatedData;

        const created = newReportData.findOrCreateTestPlanReport.created;
        const reportIsNew = !!created.find(item => item.testPlanReport.id);
        if (!reportIsNew) {
            setAlertCompletion({
                message:
                    'Aborting because a report already exists and continuing would overwrite its data.',
                success: false,
                visible: true
            });
            return;
        }

        setNewReport(true);

        for (const testPlanRun of runsWithResults) {
            const { data: runData } = await client.mutate({
                mutation: CREATE_TEST_PLAN_RUN_MUTATION,
                variables: {
                    testPlanReportId: newReportId,
                    testerUserId: testPlanRun.tester.id
                }
            });

            // Set the number of created runs
            setLoadingSpinnerProgress(prevState => ({
                visible: true,
                numerator: prevState.numerator + 1,
                denominator: runsWithResults.length + copyableTestResults.length
            }));

            const testPlanRunId =
                runData.testPlanReport.assignTester.testPlanRun.id;

            for (const testResult of testPlanRun.testResults) {
                const testId = currentTestIdsToNewTestIds[testResult.test.id];
                if (!testId) continue;

                const { data: testResultData } = await client.mutate({
                    mutation: CREATE_TEST_RESULT_MUTATION,
                    variables: { testPlanRunId, testId }
                });

                const testResultSkeleton =
                    testResultData.testPlanRun.findOrCreateTestResult
                        .testResult;

                const copiedTestResultInput = copyTestResult(
                    testResultSkeleton,
                    testResult
                );

                const saveMutation = testResult.completedAt
                    ? SUBMIT_TEST_RESULT_MUTATION
                    : SAVE_TEST_RESULT_MUTATION;

                const { data: savedData } = await client.mutate({
                    mutation: saveMutation,
                    variables: {
                        testResultId: copiedTestResultInput.id,
                        testResultInput: copiedTestResultInput
                    }
                });

                if (savedData.errors) throw savedData.errors;

                // Set the number of created results
                setLoadingSpinnerProgress(prevState => ({
                    ...prevState,
                    numerator: prevState.numerator + 1
                }));
            }
        }

        setSafeToDeleteReportId(currentReportId);

        setAlertCompletion({
            message: 'Completed without errors.',
            success: true,
            visible: true
        });

        setLoadingSpinnerProgress(prevState => ({
            ...prevState,
            visible: false
        }));
    };

    const closeAndDeleteOldTestPlan = async () => {
        if (newReport) {
            if (deleteChecked) {
                await deleteOldTestPlanReport();
            }
            await triggerTestPlanReportUpdate();
        }

        handleClose();
    };

    const deleteOldTestPlanReport = async () => {
        await client.mutate({
            mutation: DELETE_TEST_PLAN_REPORT,
            variables: {
                testPlanReportId: safeToDeleteReportId
            }
        });
        setSafeToDeleteReportId(null);
    };

    return (
        <Modal
            show={show}
            onHide={deleteChecked ? closeAndDeleteOldTestPlan : handleClose}
            dialogClassName="modal-50w"
        >
            <Modal.Header closeButton className="test-plan-updater-header">
                <Modal.Title>Test Plan Updater</Modal.Title>
            </Modal.Header>
            {showModalData && (
                <>
                    <Modal.Body>
                        <div className="version-info-wrapper">
                            <div className="version-info-label">
                                <b>Test Plan:</b> {currentVersion.title}
                            </div>
                            <div className="version-info-label">
                                <b>AT and Browser:</b> {atName} {atVersion} with{' '}
                                {browserName} {browserVersion}
                            </div>
                            <div className="current-version version-info-label">
                                <b>Current version:</b>{' '}
                                {gitUpdatedDateToString(
                                    currentVersion.updatedAt
                                )}{' '}
                                {currentVersion.gitMessage} (
                                {currentVersion.gitSha.substring(0, 7)})
                            </div>
                        </div>
                        <div>
                            <h3>Select a Different Test Plan Version</h3>
                            {latestVersions.length > 1 && (
                                <Form.Control
                                    as="select"
                                    onChange={selectVersion}
                                    defaultValue="unselected"
                                    className="version-select"
                                >
                                    <option value="unselected">
                                        Please choose a new version
                                    </option>
                                    {(() =>
                                        latestVersions.map(testPlanVersion => (
                                            <option
                                                key={testPlanVersion.id}
                                                disabled={
                                                    currentVersion.id ===
                                                    testPlanVersion.id
                                                }
                                                value={testPlanVersion.id}
                                            >
                                                {currentVersion.id ===
                                                testPlanVersion.id
                                                    ? '[Current Version] '
                                                    : ''}
                                                {gitUpdatedDateToString(
                                                    testPlanVersion.updatedAt
                                                )}{' '}
                                                {testPlanVersion.gitMessage} (
                                                {testPlanVersion.gitSha.substring(
                                                    0,
                                                    7
                                                )}
                                                )
                                            </option>
                                        )))()}
                                </Form.Control>
                            )}
                            {(latestVersions.length === 1 && (
                                <p>
                                    This report is already on the latest
                                    version.
                                </p>
                            )) ||
                                (() => {
                                    if (!versionData) {
                                        return (
                                            <p>
                                                The number of test results to
                                                copy will be shown here after
                                                you choose a new version.
                                            </p>
                                        );
                                    }
                                    if (runsWithResults.length === 0) {
                                        return (
                                            <p>
                                                There are no test results
                                                associated with this report.
                                            </p>
                                        );
                                    }

                                    const testers = runsWithResults.map(
                                        testPlanRun =>
                                            testPlanRun.tester.username
                                    );

                                    let deletionNote;
                                    if (!testsToDelete.length) {
                                        deletionNote = (
                                            <>
                                                All test results can be copied
                                                from the old report to the new
                                                report.
                                            </>
                                        );
                                    } else {
                                        deletionNote = (
                                            <>
                                                Note that {testsToDelete.length}{' '}
                                                tests differ between the old and
                                                new versions and cannot be
                                                automatically copied.
                                            </>
                                        );
                                    }

                                    return (
                                        <Alert
                                            variant={
                                                testsToDelete.length
                                                    ? 'danger'
                                                    : 'info'
                                            }
                                        >
                                            Found {allTestResults.length} test
                                            results for{' '}
                                            {testers.length > 1
                                                ? 'testers'
                                                : 'tester'}{' '}
                                            {toSentence(testers)}.{' '}
                                            {deletionNote}
                                        </Alert>
                                    );
                                })()}
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="test-plan-updater-footer">
                        <div className="submit-buttons-row">
                            <Form.Check
                                type="checkbox"
                                className="delete-checkbox"
                            >
                                <Form.Check.Input
                                    type="checkbox"
                                    onChange={() => {
                                        setDeleteChecked(!deleteChecked);
                                    }}
                                    checked={deleteChecked}
                                />
                                <Form.Check.Label className="delete-label">
                                    <FontAwesomeIcon
                                        icon={faTrashAlt}
                                        className="trash-icon"
                                    />{' '}
                                    Delete old Test Plan
                                </Form.Check.Label>
                            </Form.Check>
                            <div className="side-button-container">
                                <Button
                                    variant="secondary"
                                    onClick={handleClose}
                                    className="cancel-button"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    className="submit-button"
                                    disabled={!canCreateNewReport}
                                    onClick={createNewReportWithData}
                                >
                                    Update Test Plan
                                </Button>
                            </div>
                        </div>
                    </Modal.Footer>
                </>
            )}
            {loadingSpinnerProgress.visible && (
                <LoadingSpinner
                    percentage={Math.floor(
                        (loadingSpinnerProgress.numerator /
                            loadingSpinnerProgress.denominator) *
                            100
                    )}
                    className="loading-spinner"
                />
            )}
            {alertCompletion.visible && (
                <>
                    <Modal.Body>
                        <Alert
                            className="completion-alert"
                            variant={
                                alertCompletion.success ? 'success' : 'danger'
                            }
                        >
                            {alertCompletion.message}
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer className="test-plan-updater-footer">
                        <Button
                            variant="secondary"
                            onClick={closeAndDeleteOldTestPlan}
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </>
            )}
        </Modal>
    );
};

TestPlanUpdaterModal.propTypes = {
    show: PropTypes.bool,
    isAdmin: PropTypes.bool,
    details: PropTypes.object,
    handleClose: PropTypes.func,
    handleAction: PropTypes.func,
    testPlanReportId: PropTypes.string,
    triggerTestPlanReportUpdate: PropTypes.func
};

export default TestPlanUpdaterModal;
