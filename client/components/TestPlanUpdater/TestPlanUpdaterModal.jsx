import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useApolloClient } from '@apollo/client';
import { Alert, Modal, Button, Form } from 'react-bootstrap';
import { gitUpdatedDateToString } from '../../utils/gitUtils';
import hash from 'object-hash';
import { omit } from 'lodash';
import { TEST_PLAN_ID_QUERY, UPDATER_QUERY, VERSION_QUERY } from './queries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './TestPlanUpdaterModal.css';
import '../TestRun/TestRun.css';

const toSentence = array => {
    // https://stackoverflow.com/a/24376930/3888572
    return array.join(', ').replace(/,\s([^,]+)$/, ' and $1');
};

const TestPlanUpdaterModal = ({ show, handleClose, testPlanReportId }) => {
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

    useEffect(() => {
        loadInitialData({ client, setUpdaterData, testPlanReportId });
    }, []);

    if (!updaterData) {
        return <Modal show={false}></Modal>;
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

    return (
        <Modal show={show} onHide={handleClose} dialogClassName="modal-90w">
            <Modal.Header closeButton className="test-plan-updater-header">
                <Modal.Title>Test Plan Updater</Modal.Title>
            </Modal.Header>
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
                        {gitUpdatedDateToString(currentVersion.updatedAt)}{' '}
                        {currentVersion.gitMessage} (
                        {currentVersion.gitSha.substring(0, 7)})
                    </div>
                </div>
                <div>
                    <h3>Select a Different Test Plan Version</h3>
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
                            testPlanVersions.map(testPlanVersion => (
                                <option
                                    key={testPlanVersion.id}
                                    disabled={
                                        currentVersion.id === testPlanVersion.id
                                    }
                                    value={testPlanVersion.id}
                                >
                                    {currentVersion.id === testPlanVersion.id
                                        ? '[Current Version] '
                                        : ''}
                                    {gitUpdatedDateToString(
                                        testPlanVersion.updatedAt
                                    )}{' '}
                                    {testPlanVersion.gitMessage} (
                                    {testPlanVersion.gitSha.substring(0, 7)})
                                </option>
                            )))()}
                    </Form.Control>
                    {(() => {
                        if (!versionData) {
                            return (
                                <p>
                                    The number of test results to copy will be
                                    shown here after you choose a new version.
                                </p>
                            );
                        }
                        if (runsWithResults.length === 0) {
                            return (
                                <p>
                                    There are no test results associated with
                                    this report.
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
                                    All test results can be copied from the old
                                    report to the new report.
                                </>
                            );
                        } else {
                            deletionNote = (
                                <>
                                    Note that {testsToDelete.length} tests
                                    differ between the old and new versions and
                                    cannot be automatically copied.
                                </>
                            );
                        }

                        return (
                            <Alert
                                variant={
                                    testsToDelete.length ? 'danger' : 'info'
                                }
                            >
                                Found {allTestResults.length} test results for{' '}
                                {testers.length > 1 ? 'testers' : 'tester'}{' '}
                                {toSentence(testers)}. {deletionNote}
                            </Alert>
                        );
                    })()}
                </div>
            </Modal.Body>
            <Modal.Footer className="test-plan-updater-footer">
                <div className="submit-buttons-row">
                    <Form.Check type="checkbox" className="delete-checkbox">
                        <Form.Check.Input type="checkbox" />
                        <Form.Check.Label className="delete-label">
                            <FontAwesomeIcon
                                icon={faTrashAlt}
                                className="trash-icon"
                            />{' '}
                            Delete old Test Plan
                        </Form.Check.Label>
                    </Form.Check>
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        className="cancel-button"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleClose}
                        className="submit-button"
                        disabled={!canCreateNewReport}
                        //onClick={createNewReportWithData}
                    >
                        Update Test Plan
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

TestPlanUpdaterModal.propTypes = {
    show: PropTypes.bool,
    isAdmin: PropTypes.bool,
    details: PropTypes.object,
    handleClose: PropTypes.func,
    handleAction: PropTypes.func,
    testPlanReportId: PropTypes.string
};

export default TestPlanUpdaterModal;
