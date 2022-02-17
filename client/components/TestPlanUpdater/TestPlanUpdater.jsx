import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useApolloClient } from '@apollo/client';
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
import nextId from 'react-id-generator';
import PageStatus from '../common/PageStatus';
import { gitUpdatedDateToString } from '../../utils/gitUtils';
import { useLocation } from 'react-router-dom';
import { Alert, Button, Form } from 'react-bootstrap';
import hash from 'object-hash';
import { omit } from 'lodash';
import { Helmet } from 'react-helmet';

const toSentence = array => {
    // https://stackoverflow.com/a/24376930/3888572
    return array.join(', ').replace(/,\s([^,]+)$/, ' and $1');
};

const TestPlanVersionUpdater = () => {
    const loadInitialData = async ({ client, setUpdaterData, location }) => {
        const testPlanReportId = location.search.match(/\?id=(\d+)/)?.[1];
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
    const [eventLogMessages, setEventLogMessages] = useState([]);
    const [safeToDeleteReportId, setSafeToDeleteReportId] = useState();
    const [isOldReportDeleted, setIsOldReportDeleted] = useState(false);
    const location = useLocation();

    useEffect(() => {
        loadInitialData({ client, setUpdaterData, location });
    }, []);

    if (!updaterData) {
        return (
            <PageStatus
                title="Test Plan Updater | ARIA-AT"
                heading="Test Plan Updater"
            />
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

    const logEvent = eventLogMessage => {
        setEventLogMessages(previousEventLogMessages => [
            ...previousEventLogMessages,
            eventLogMessage
        ]);
    };

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
            logEvent(
                'Aborting because a report already exists and continuing would ' +
                    'overwrite its data.'
            );
            return;
        }
        logEvent('Created new report.');

        let numberOfCreatedRuns = 0;
        let numberOfCreatedResults = 0;
        for (const testPlanRun of runsWithResults) {
            const { data: runData } = await client.mutate({
                mutation: CREATE_TEST_PLAN_RUN_MUTATION,
                variables: {
                    testPlanReportId: newReportId,
                    testerUserId: testPlanRun.tester.id
                }
            });

            numberOfCreatedRuns += 1;

            logEvent(
                `Created ${numberOfCreatedRuns} of ${runsWithResults.length} ` +
                    `runs for ${testPlanRun.tester.username}.`
            );

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

                numberOfCreatedResults += 1;

                if (
                    numberOfCreatedResults === copyableTestResults.length ||
                    numberOfCreatedResults % 5 === 0
                ) {
                    logEvent(
                        `Created ${numberOfCreatedResults} of ` +
                            `${copyableTestResults.length} results.`
                    );
                }
            }
        }

        setSafeToDeleteReportId(currentReportId);

        logEvent('Completed without errors.');
    };

    const deleteOldTestPlanReport = async () => {
        await client.mutate({
            mutation: DELETE_TEST_PLAN_REPORT,
            variables: {
                testPlanReportId: safeToDeleteReportId
            }
        });
        setSafeToDeleteReportId(null);
        setIsOldReportDeleted(true);
    };

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>Test Plan Updater | ARIA-AT</title>
            </Helmet>
            <h1>Test Plan Updater</h1>
            <h2>Explanation</h2>
            <p>
                This tool migrates test results from an old test plan version to
                a new test plan version.
            </p>
            <p>
                This might be needed if a bug or inconsistency is found in a
                test plan after test results have already been collected.
                Previously, test results had to be rerun even if the huge
                majority of tests had not actually changed.
            </p>
            <p>
                For the selected report, this tool will create a new report with
                an updated test plan version and copy each of the results from
                the old report to the new report. Note that any tests which
                differ between versions cannot be automatically copied.
            </p>
            <h2>Selected Report</h2>
            <Alert variant="secondary">
                {atName} {atVersion} with {browserName} {browserVersion}{' '}
                {currentVersion.title}
            </Alert>
            <h2>Pick a Version</h2>
            <Alert variant="secondary">
                Current version is{' '}
                {gitUpdatedDateToString(currentVersion.updatedAt)}{' '}
                {currentVersion.gitMessage} (
                {currentVersion.gitSha.substring(0, 7)})
            </Alert>
            <Form.Control
                as="select"
                onChange={selectVersion}
                defaultValue="unselected"
            >
                <option value="unselected">Please choose a new version</option>
                {(() =>
                    testPlanVersions.map(testPlanVersion => (
                        <option
                            key={testPlanVersion.id}
                            disabled={currentVersion.id === testPlanVersion.id}
                            value={testPlanVersion.id}
                        >
                            {currentVersion.id === testPlanVersion.id
                                ? '[Current Version] '
                                : ''}
                            {gitUpdatedDateToString(testPlanVersion.updatedAt)}{' '}
                            {testPlanVersion.gitMessage} (
                            {testPlanVersion.gitSha.substring(0, 7)})
                        </option>
                    )))()}
            </Form.Control>
            <h2>Create the New Report</h2>
            {(() => {
                if (!versionData) {
                    return (
                        <p>
                            The number of test results to copy will be shown
                            here after you choose a new version.
                        </p>
                    );
                }
                if (runsWithResults.length === 0) {
                    <p>
                        There are no test results associated with this report.
                    </p>;
                }

                const testers = runsWithResults.map(
                    testPlanRun => testPlanRun.tester.username
                );

                let deletionNote;
                if (!testsToDelete.length) {
                    deletionNote = (
                        <>
                            All test results can be copied from the old report
                            to the new report.
                        </>
                    );
                } else {
                    deletionNote = (
                        <>
                            Note that {testsToDelete.length} tests differ
                            between the old and new versions and cannot be
                            automatically copied.
                        </>
                    );
                }

                return (
                    <Alert variant={testsToDelete.length ? 'danger' : 'info'}>
                        Found {allTestResults.length} test results for{' '}
                        {testers.length > 1 ? 'testers' : 'tester'}{' '}
                        {toSentence(testers)}. {deletionNote}
                    </Alert>
                );
            })()}
            <Button
                variant="primary"
                disabled={!canCreateNewReport}
                onClick={createNewReportWithData}
                className="mb-3"
            >
                Create updated report
            </Button>
            <div aria-live="polite">
                {eventLogMessages.map(eventLogMessage => (
                    <p key={nextId()}>{eventLogMessage}</p>
                ))}
            </div>
            <h2>Delete the Old Report</h2>
            <Button
                variant="secondary"
                disabled={!safeToDeleteReportId}
                onClick={deleteOldTestPlanReport}
                className="mb-3"
            >
                Delete old report
            </Button>
            <div aria-live="polite">
                {isOldReportDeleted ? 'The old report has been deleted.' : ''}
            </div>
        </Container>
    );
};

export default TestPlanVersionUpdater;
