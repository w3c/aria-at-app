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

        const testPlanVersionId = updaterData.testPlan.latestTestPlanVersion.id;
        const atId = updaterData.testPlanReport.testPlanTarget.at.id;

        const { data: versionData } = await client.query({
            query: VERSION_QUERY,
            variables: {
                testPlanReportId,
                testPlanVersionId,
                atId
            }
        });
        setVersionData(versionData);
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
    const [backupChecked, setBackupChecked] = useState(false);
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
        testPlan: { latestTestPlanVersion }
    } = updaterData;

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
            if (!backupChecked) {
                await deleteOldTestPlanReport();
            }
            await triggerTestPlanReportUpdate();
        }

        handleClose();
    };

    const deleteOldTestPlanReport = async () => {
        setAlertCompletion({
            visible: true,
            success: false,
            message: 'Deleting old report...'
        });
        await client.mutate({
            mutation: DELETE_TEST_PLAN_REPORT,
            variables: {
                testPlanReportId: safeToDeleteReportId
            }
        });
        setSafeToDeleteReportId(null);
        setAlertCompletion({
            visible: true,
            success: true,
            message: 'Old report deleted.'
        });
    };

    return (
        <Modal
            show={show}
            onHide={backupChecked ? closeAndDeleteOldTestPlan : handleClose}
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
                            <div className="new-version version-info-label">
                                <b>Latest version: </b>
                                {gitUpdatedDateToString(
                                    latestTestPlanVersion.updatedAt
                                )}{' '}
                                {latestTestPlanVersion.gitMessage} (
                                {latestTestPlanVersion.gitSha.substring(0, 7)})
                            </div>
                        </div>
                        <div>
                            {(() => {
                                if (!versionData) {
                                    return (
                                        <p>
                                            The number of test results to copy
                                            will be shown here after you choose
                                            a new version.
                                        </p>
                                    );
                                }
                                if (runsWithResults.length === 0) {
                                    return (
                                        <p>
                                            There are no test results associated
                                            with this report.
                                        </p>
                                    );
                                }

                                const testers = runsWithResults.map(
                                    testPlanRun => testPlanRun.tester.username
                                );

                                let deletionNote;
                                if (!testsToDelete.length) {
                                    deletionNote = (
                                        <>
                                            All test results can be copied from
                                            the old report to the new report.
                                        </>
                                    );
                                } else {
                                    deletionNote = (
                                        <>
                                            Note that {testsToDelete.length}{' '}
                                            {testsToDelete.length === 1
                                                ? 'test'
                                                : test}{' '}
                                            differ between the old and new
                                            versions and cannot be automatically
                                            copied.
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
                                        {toSentence(testers)}. {deletionNote}
                                    </Alert>
                                );
                            })()}
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="test-plan-updater-footer">
                        <div className="submit-buttons-row">
                            <Form.Check
                                type="checkbox"
                                className="backup-checkbox"
                            >
                                <Form.Check.Label>
                                    <Form.Check.Input
                                        type="checkbox"
                                        onChange={() => {
                                            setBackupChecked(!backupChecked);
                                        }}
                                        checked={backupChecked}
                                    />
                                    Backup Test Plan before Update
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
                                    variant={
                                        !backupChecked ? 'danger' : 'primary'
                                    }
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
                </>
            )}
            {!showModalData && (
                <Modal.Footer className="test-plan-updater-footer">
                    <Button
                        variant="secondary"
                        onClick={closeAndDeleteOldTestPlan}
                    >
                        Done
                    </Button>
                </Modal.Footer>
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
