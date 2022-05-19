import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams, useHistory } from 'react-router-dom';
import useRouterQuery from '../../hooks/useRouterQuery';
import { useQuery, useMutation } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRedo,
    faExclamationCircle,
    faCheck,
    faPen
} from '@fortawesome/free-solid-svg-icons';
import nextId from 'react-id-generator';
import { Alert, Button, Col, Container, Row } from 'react-bootstrap';
import TestNavigator from './TestNavigator';
import ReviewConflictsModal from './ReviewConflictsModal';
import StatusBar from './StatusBar';
import TestRenderer from '../TestRenderer';
import OptionButton from './OptionButton';
import PageStatus from '../common/PageStatus';
import BasicModal from '../common/BasicModal';
import AtAndBrowserDetailsModal from '../common/AtAndBrowserDetailsModal';
import DisplayNone from '../../utils/DisplayNone';
import {
    TEST_RUN_PAGE_QUERY,
    TEST_RUN_PAGE_ANON_QUERY,
    FIND_OR_CREATE_TEST_RESULT_MUTATION,
    SAVE_TEST_RESULT_MUTATION,
    SUBMIT_TEST_RESULT_MUTATION,
    DELETE_TEST_RESULT_MUTATION
} from './queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import './TestRun.css';
import ReviewConflicts from '../ReviewConflicts';

const createGitHubIssueWithTitleAndBody = ({
    test,
    testPlanReport,
    conflictMarkdown = null
}) => {
    const { testPlanVersion, at, browser } = testPlanReport;
    const testPlanTarget = { atVersion: 'FIXME', browserVersion: 'FIXME' }; // FIXME: Should be attached to testPlanRun object (assumption)

    const title =
        `Feedback: "${test.title}" (${testPlanVersion.title}, ` +
        `Test ${test.rowNumber})`;

    const shortenedUrl = test.renderedUrl.match(/[^/]+$/)[0];

    let body =
        `## Description of Behavior\n\n` +
        `<!-- write your description here -->\n\n` +
        `## Test Setup\n\n` +
        `- Test File at Exact Commit: ` +
        `[${shortenedUrl}](https://aria-at.w3.org${test.renderedUrl})\n` +
        `- AT: ` +
        `${at.name} (version ${testPlanTarget.atVersion})\n` +
        `- Browser: ` +
        `${browser.name} (version ${testPlanTarget.browserVersion})\n`;

    if (conflictMarkdown) {
        body += `\n${conflictMarkdown}`;
    }

    return (
        `https://github.com/w3c/aria-at/issues/new?title=${encodeURI(title)}&` +
        `body=${encodeURIComponent(body)}`
    );
};

const TestRun = () => {
    const params = useParams();
    const history = useHistory();
    const routerQuery = useRouterQuery();

    const titleRef = useRef();
    const pageReadyRef = useRef(false);
    const testRunStateRef = useRef();
    // HACK: Temporary fix to allow for consistency of TestRenderer after
    // testRunStateRef is nullified during unmount.
    // See 'unmount' of 'pageContent' hook in the TestRenderer component
    const recentTestRunStateRef = useRef();
    const testRunResultRef = useRef();
    const testRendererSubmitButtonRef = useRef();
    const conflictMarkdownRef = useRef();

    const { runId: testPlanRunId, testPlanReportId } = params;

    const { loading, data, error, refetch } = useQuery(
        testPlanRunId ? TEST_RUN_PAGE_QUERY : TEST_RUN_PAGE_ANON_QUERY,
        {
            variables: { testPlanRunId, testPlanReportId }
        }
    );
    const [createTestResult, { loading: createTestLoading }] = useMutation(
        FIND_OR_CREATE_TEST_RESULT_MUTATION
    );
    const [saveTestResult] = useMutation(SAVE_TEST_RESULT_MUTATION);
    const [submitTestResult] = useMutation(SUBMIT_TEST_RESULT_MUTATION);
    const [deleteTestResult] = useMutation(DELETE_TEST_RESULT_MUTATION);

    const [isFirstPageLoad, setIsFirstPageLoad] = useState(true);
    const [isRendererReady, setIsRendererReady] = useState(false);
    const [isTestSubmitClicked, setIsTestSubmitClicked] = useState(false);
    const [isTestEditClicked, setIsTestEditClicked] = useState(false);
    const [showTestNavigator, setShowTestNavigator] = useState(true);
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [atVersionId, setAtVersionId] = useState();
    const [browserVersionId, setBrowserVersionId] = useState();
    const [showStartOverModal, setShowStartOverModal] = useState(false);
    const [showReviewConflictsModal, setShowReviewConflictsModal] = useState(
        false
    );
    const [showGetInvolvedModal, setShowGetInvolvedModal] = useState(false);

    useEffect(() => setup(), [currentTestIndex]);

    const setup = () => {
        pageReadyRef.current = false;
        testRunStateRef.current = null;
        recentTestRunStateRef.current = null;
        testRunResultRef.current = null;
        conflictMarkdownRef.current = null;
        setIsRendererReady(false);
        setIsTestSubmitClicked(false);

        if (titleRef.current) titleRef.current.focus();
    };

    if (error) {
        const { message } = error;
        return (
            <PageStatus
                title="Error - Test Results | ARIA-AT"
                heading="Testing Task"
                message={message}
                isError
            />
        );
    }

    if (!data || loading || createTestLoading) {
        return (
            <PageStatus
                title="Loading - Test Results | ARIA-AT"
                heading="Testing Task"
            />
        );
    }

    const auth = evaluateAuth(data && data.me ? data.me : {});
    let { id: userId, isSignedIn, isAdmin } = auth;

    const { testPlanRun, users, ats = [], browsers = [] } = data;
    const { tester, testResults = [] } = testPlanRun || {};
    let { testPlanReport } = testPlanRun || {};

    // if a signed in user navigates to this page, treat them as anon to prevent
    // invalid save attempts
    if (testPlanReportId) isSignedIn = false;
    if (!isSignedIn) testPlanReport = data.testPlanReport;

    const { testPlanVersion, runnableTests = [], conflicts = [] } =
        testPlanReport || {};

    // check to ensure an admin that manually went to a test run url doesn't
    // run the test as themselves
    const openAsUserId =
        routerQuery.get('user') || (tester && tester.id !== userId)
            ? tester.id
            : null;
    const testerId = openAsUserId || userId;

    if (isSignedIn && !testPlanRun) {
        return (
            <PageStatus
                title="Error - Test Results | ARIA-AT"
                heading="Testing Task"
                message="Unavailable"
                isError
            />
        );
    }

    const toggleTestNavigator = () => setShowTestNavigator(!showTestNavigator);

    const createTestResultForRenderer = async (
        testId,
        atVersionId,
        browserVersionId
    ) => {
        if (atVersionId && browserVersionId) {
            await createTestResult({
                variables: {
                    testPlanRunId,
                    testId,
                    atVersionId,
                    browserVersionId
                }
            });
            pageReadyRef.current = true;
            await refetch();
        } else pageReadyRef.current = true;
    };

    const tests = runnableTests.map((test, index) => ({
        ...test,
        index,
        seq: index + 1,
        testResult: testResults.find(t => t.test.id === test.id),
        hasConflicts: !!conflicts.find(c => c.source.test.id === test.id)
    }));
    const currentTest = tests[currentTestIndex];
    const hasTestsToRun = tests.length;

    const getResourceVersionFromId = (
        sourceData, // ats or browsers
        resourceId, // id of AT or Browser
        versionId, // id of AT version or Browser version
        versionsIdentifier // atVersions or browserVersions
    ) => {
        return sourceData
            .find(item => item.id == resourceId)
            [versionsIdentifier].find(item => item.id == versionId);
    };

    const getVersionsForResource = (
        sourceData, // ats or browsers
        resourceName, // eg. NVDA, Chrome, etc
        versionsIdentifier // atVersions or browserVersions
    ) => {
        return (
            sourceData
                .find(item => item.name === resourceName)
                [versionsIdentifier].map(item => item) || []
        );
    };

    const defaultAtVersionId = getVersionsForResource(
        ats,
        testPlanReport.at.name,
        'atVersions'
    )[0].id;

    const defaultBrowserVersionId = getVersionsForResource(
        browsers,
        testPlanReport.browser.name,
        'browserVersions'
    )[0].id;

    const currentTestAtVersionId =
        currentTest.testResult?.atVersionId ||
        atVersionId ||
        defaultAtVersionId;

    const currentTestBrowserVersionId =
        currentTest.testResult?.browserVersionId ||
        browserVersionId ||
        defaultBrowserVersionId;

    const currentAtVersion = getResourceVersionFromId(
        ats,
        testPlanReport.at.id,
        currentTestAtVersionId,
        'atVersions'
    );
    const currentBrowserVersion = getResourceVersionFromId(
        browsers,
        testPlanReport.browser.id,
        currentTestBrowserVersionId,
        'browserVersions'
    );

    if (!currentTest.testResult && !pageReadyRef.current && isSignedIn)
        (async () =>
            await createTestResultForRenderer(
                currentTest.id,
                currentTestAtVersionId,
                currentTestBrowserVersionId
            ))();
    else pageReadyRef.current = true;

    const gitHubIssueLinkWithTitleAndBody = createGitHubIssueWithTitleAndBody({
        test: currentTest,
        testPlanReport,
        conflictMarkdown: conflictMarkdownRef.current
    });

    const navigateTests = (previous = false) => {
        // assume navigation forward if previous is false
        let newTestIndex = currentTest.seq;
        if (!previous) {
            // next
            const newTestIndexToEval = currentTest.seq + 1;
            if (newTestIndexToEval <= tests.length)
                newTestIndex = newTestIndexToEval;
        } else {
            // previous
            const newTestIndexToEval = currentTest.seq - 1;
            if (newTestIndexToEval >= 1 && newTestIndexToEval <= tests.length)
                newTestIndex = newTestIndexToEval;
        }
        setCurrentTestIndex(tests.find(t => t.seq === newTestIndex).index);
    };

    const remapScenarioResults = (
        rendererState,
        scenarioResults,
        captureHighlightRequired = false
    ) => {
        let newScenarioResults = [];
        if (!rendererState || !scenarioResults) {
            throw new Error(
                `Unable to merge invalid results:rendererState:${rendererState} | scenarioResults:${scenarioResults}`
            );
        }

        const { commands } = rendererState;
        if (!commands || commands.length !== scenarioResults.length) {
            throw new Error(
                `Unable to merge invalid results:commands:${commands} | commands.length !== scenarioResults.length:${commands.length !==
                    scenarioResults.length}`
            );
        }

        for (let i = 0; i < commands.length; i++) {
            let scenarioResult = { ...scenarioResults[i] };
            let assertionResults = [];
            let unexpectedBehaviors = null;

            // collect variables
            const { atOutput, assertions, unexpected } = commands[i];

            // process assertion results
            for (let j = 0; j < assertions.length; j++) {
                const { result, highlightRequired } = assertions[j];
                const assertionResult = {
                    ...scenarioResult.assertionResults[j],
                    passed: result === 'pass',
                    failedReason:
                        result === 'failMissing'
                            ? 'NO_OUTPUT'
                            : result === 'failIncorrect'
                            ? 'INCORRECT_OUTPUT'
                            : null
                };
                assertionResults.push(
                    captureHighlightRequired
                        ? { ...assertionResult, highlightRequired }
                        : assertionResult
                );
            }

            // process unexpected behaviors
            const { hasUnexpected, behaviors, highlightRequired } = unexpected;
            if (hasUnexpected === 'hasUnexpected') {
                unexpectedBehaviors = [];
                /**
                 * 0 = EXCESSIVELY_VERBOSE
                 * 1 = UNEXPECTED_CURSOR_POSITION
                 * 2 = SLUGGISH
                 * 3 = AT_CRASHED
                 * 4 = BROWSER_CRASHED
                 * 5 = OTHER
                 */
                for (let i = 0; i < behaviors.length; i++) {
                    const behavior = behaviors[i];
                    if (behavior.checked) {
                        if (i === 0)
                            unexpectedBehaviors.push({
                                id: 'EXCESSIVELY_VERBOSE'
                            });
                        if (i === 1)
                            unexpectedBehaviors.push({
                                id: 'UNEXPECTED_CURSOR_POSITION'
                            });
                        if (i === 2)
                            unexpectedBehaviors.push({ id: 'SLUGGISH' });
                        if (i === 3)
                            unexpectedBehaviors.push({ id: 'AT_CRASHED' });
                        if (i === 4)
                            unexpectedBehaviors.push({ id: 'BROWSER_CRASHED' });
                        if (i === 5) {
                            const moreResult = {
                                id: 'OTHER',
                                otherUnexpectedBehaviorText: behavior.more.value
                            };
                            unexpectedBehaviors.push(
                                captureHighlightRequired
                                    ? {
                                          ...moreResult,
                                          highlightRequired:
                                              behavior.more.highlightRequired
                                      }
                                    : moreResult
                            );
                        }
                    }
                }
            } else if (hasUnexpected === 'doesNotHaveUnexpected')
                unexpectedBehaviors = [];

            // re-assign scenario result due to read only values
            scenarioResult.output = atOutput.value ? atOutput.value : null;
            if (captureHighlightRequired)
                scenarioResult.highlightRequired = atOutput.highlightRequired;
            scenarioResult.assertionResults = [...assertionResults];
            scenarioResult.unexpectedBehaviors = unexpectedBehaviors
                ? [...unexpectedBehaviors]
                : null;
            if (captureHighlightRequired)
                scenarioResult.unexpectedBehaviorHighlightRequired = highlightRequired;

            newScenarioResults.push(scenarioResult);
        }

        return newScenarioResults;
    };

    const remapState = (rendererState, testResult) => {
        if (
            !rendererState ||
            !testResult.scenarioResults ||
            rendererState.commands.length !== testResult.scenarioResults.length
        )
            return testResult;

        const scenarioResults = remapScenarioResults(
            rendererState,
            testResult.scenarioResults,
            true
        );
        return { ...testResult, scenarioResults };
    };

    const performButtonAction = async (action, index) => {
        // TODO: Revise function
        const saveForm = async (
            withResult = false,
            forceSave = false,
            forceEdit = false
        ) => {
            if (forceEdit) setIsTestEditClicked(true);
            else setIsTestEditClicked(false);

            if (!isSignedIn) return true;
            if (!forceEdit && currentTest.testResult.completedAt) return true;

            const scenarioResults = remapScenarioResults(
                testRunStateRef.current || recentTestRunStateRef.current,
                currentTest.testResult.scenarioResults,
                false
            );

            await handleSaveOrSubmitTestResultAction(
                { scenarioResults },
                forceSave ? false : !!testRunResultRef.current
            );
            if (withResult && !forceSave) return !!testRunResultRef.current;
            return true;
        };

        switch (action) {
            case 'goToTestAtIndex': {
                // Save renderer's form state
                await saveForm(false, true);
                setCurrentTestIndex(index);
                break;
            }
            case 'goToNextTest': {
                // Save renderer's form state
                await saveForm(false, true);
                navigateTests();
                break;
            }
            case 'goToPreviousTest': {
                // Save renderer's form state
                await saveForm(false, true);
                navigateTests(true);
                break;
            }
            case 'editTest': {
                testRunResultRef.current = null;
                await saveForm(false, true, true);
                if (titleRef.current) titleRef.current.focus();
                break;
            }
            case 'saveTest': {
                if (!isSignedIn) {
                    setShowGetInvolvedModal(true);
                    break;
                }
                if (testRendererSubmitButtonRef.current) {
                    testRendererSubmitButtonRef.current.click();
                    setIsTestSubmitClicked(true);

                    // check to see if form was successfully submitted, if so, return to top of summary document
                    const forceFocusOnSave = await saveForm(true);
                    if (forceFocusOnSave)
                        if (titleRef.current) titleRef.current.focus();
                }
                break;
            }
            case 'closeTest': {
                // Save renderer's form state
                await saveForm();
                history.push('/test-queue');
                break;
            }
        }
    };

    const handleTestClick = async index =>
        await performButtonAction('goToTestAtIndex', index);

    const handleSaveClick = async () => performButtonAction('saveTest');

    const handleNextTestClick = async () => performButtonAction('goToNextTest');

    const handlePreviousTestClick = async () =>
        performButtonAction('goToPreviousTest');

    const handleCloseRunClick = async () => performButtonAction('closeTest');

    const handleEditClick = async () => performButtonAction('editTest');

    const handleStartOverButtonClick = async () => setShowStartOverModal(true);

    const handleStartOverAction = async () => {
        const { id } = currentTest.testResult;
        let variables = {
            id
        };
        await deleteTestResult({ variables });

        setup();
        await createTestResultForRenderer(
            currentTest.id,
            currentTestAtVersionId,
            currentTestBrowserVersionId
        );

        // close modal after action
        setShowStartOverModal(false);
    };

    const handleSaveOrSubmitTestResultAction = async (
        { scenarioResults = [] },
        isSubmit = false
    ) => {
        const { id } = currentTest.testResult;
        let variables = {
            id,
            scenarioResults
        };

        await saveTestResult({ variables });
        if (isSubmit) await submitTestResult({ variables });
        await refetch();
    };

    const handleReviewConflictsButtonClick = async () =>
        setShowReviewConflictsModal(true);

    const renderTestContent = (testPlanReport, currentTest, heading) => {
        const { index } = currentTest;
        const isComplete = currentTest.testResult
            ? !!currentTest.testResult.completedAt
            : false;
        const isFirstTest = index === 0;
        const isLastTest = currentTest.seq === tests.length;

        let primaryButtons; // These are the list of buttons that will appear below the tests
        let forwardButtons = []; // These are buttons that navigate to next tests and continue

        const nextButton = (
            <Button variant="secondary" onClick={handleNextTestClick}>
                Next Test
            </Button>
        );

        const previousButton = (
            <Button
                variant="secondary"
                onClick={handlePreviousTestClick}
                disabled={isFirstTest}
            >
                Previous Test
            </Button>
        );

        if (isComplete) {
            const editButton = (
                <Button
                    className="edit-results"
                    variant="secondary"
                    onClick={handleEditClick}
                >
                    <FontAwesomeIcon icon={faPen} />
                    Edit Results
                </Button>
            );

            const continueButton = (
                <Button
                    variant="primary"
                    disabled={isLastTest}
                    onClick={handleNextTestClick}
                >
                    Continue
                </Button>
            );

            if (!isLastTest) forwardButtons = [nextButton];
            primaryButtons = [
                previousButton,
                editButton,
                ...forwardButtons,
                continueButton
            ];
        } else {
            // same key to maintain focus
            const saveResultsButton = (
                <Button variant="primary" onClick={handleSaveClick}>
                    Submit Results
                </Button>
            );
            if (!isLastTest) forwardButtons = [nextButton];
            primaryButtons = [
                previousButton,
                ...forwardButtons,
                saveResultsButton
            ];
        }

        const menuRightOfContent = (
            <div role="complementary">
                <h2 id="test-options-heading">Test Options</h2>
                <ul
                    className="options-wrapper"
                    aria-labelledby="test-options-heading"
                >
                    <li>
                        <OptionButton
                            text="Raise An Issue"
                            icon={
                                <FontAwesomeIcon icon={faExclamationCircle} />
                            }
                            target="_blank"
                            href={gitHubIssueLinkWithTitleAndBody}
                        />
                    </li>
                    <li>
                        <OptionButton
                            text="Start Over"
                            icon={<FontAwesomeIcon icon={faRedo} />}
                            onClick={handleStartOverButtonClick}
                            disabled={!isSignedIn}
                        />
                    </li>
                    <li>
                        <OptionButton
                            text={!isSignedIn ? 'Close' : 'Save and Close'}
                            onClick={handleCloseRunClick}
                        />
                    </li>
                    <li className="help-link">
                        <a href="mailto:public-aria-at@w3.org">
                            Email us if you need help
                        </a>
                    </li>
                </ul>
            </div>
        );

        return (
            <>
                <h1 ref={titleRef} data-test="testing-task" tabIndex={-1}>
                    <span className="task-label">Testing task:</span>{' '}
                    {`${currentTest.seq}.`} {currentTest.title}
                </h1>
                <span>{heading}</span>
                <StatusBar
                    key={nextId()}
                    hasConflicts={currentTest.hasConflicts}
                    handleReviewConflictsButtonClick={
                        handleReviewConflictsButtonClick
                    }
                />
                {pageReadyRef.current &&
                    (isSignedIn ? currentTest.testResult : true) && (
                        <Row>
                            <Col className="test-iframe-container" md={9}>
                                <Row>
                                    <TestRenderer
                                        key={nextId()}
                                        at={testPlanReport.at}
                                        testResult={
                                            !isSignedIn
                                                ? {
                                                      test: currentTest,
                                                      // force the summary to be shown for an anonymous user
                                                      completedAt: !!(
                                                          !isSignedIn &&
                                                          testRunResultRef.current
                                                      )
                                                  }
                                                : remapState(
                                                      testRunStateRef.current,
                                                      currentTest.testResult
                                                  )
                                        }
                                        testPageUrl={
                                            testPlanVersion.testPageUrl
                                        }
                                        testRunStateRef={testRunStateRef}
                                        recentTestRunStateRef={
                                            recentTestRunStateRef
                                        }
                                        testRunResultRef={testRunResultRef}
                                        submitButtonRef={
                                            testRendererSubmitButtonRef
                                        }
                                        isSubmitted={isTestSubmitClicked}
                                        isEdit={isTestEditClicked}
                                        setIsRendererReady={setIsRendererReady}
                                    />
                                </Row>
                                {isRendererReady && (
                                    <Row>
                                        <h2
                                            id="test-toolbar-heading"
                                            className="sr-only"
                                        >
                                            Test Controls
                                        </h2>
                                        <ul
                                            aria-labelledby="test-toolbar-heading"
                                            className="test-run-toolbar mt-1"
                                        >
                                            {primaryButtons.map(button => (
                                                <li key={nextId()}>{button}</li>
                                            ))}
                                        </ul>
                                    </Row>
                                )}
                            </Col>
                            <Col className="current-test-options" md={3}>
                                {menuRightOfContent}
                            </Col>
                        </Row>
                    )}
                <DisplayNone>
                    <ReviewConflicts
                        testPlanReport={testPlanReport}
                        test={currentTest}
                        conflictMarkdownRef={conflictMarkdownRef}
                    />
                </DisplayNone>

                {/* Modals */}
                {showStartOverModal && (
                    <BasicModal
                        key={`StartOver__${currentTestIndex}`}
                        show={showStartOverModal}
                        centered={true}
                        animation={false}
                        title="Start Over"
                        content={`Are you sure you want to start over Test #${currentTest.seq}? Your progress (if any), will be lost.`}
                        handleAction={handleStartOverAction}
                        handleClose={() => setShowStartOverModal(false)}
                    />
                )}
                {showGetInvolvedModal && (
                    <BasicModal
                        key={`GetInvolved__${currentTestIndex}`}
                        show={showGetInvolvedModal}
                        centered={true}
                        animation={false}
                        title="Ready to Get Involved?"
                        content={
                            <>
                                Only members of the ARIA-AT test team can submit
                                data. If you fill in this form, your data will
                                not be saved! Check out the{' '}
                                <a href="/">home page</a> to learn more about
                                how to get involved.
                            </>
                        }
                        closeLabel="Close"
                        handleClose={() => setShowGetInvolvedModal(false)}
                    />
                )}
                {showReviewConflictsModal && (
                    <ReviewConflictsModal
                        show={showReviewConflictsModal}
                        testPlanVersion={testPlanVersion}
                        testPlanReport={testPlanReport}
                        conflictMarkdown={conflictMarkdownRef.current}
                        test={currentTest}
                        key={`ReviewConflictsModal__${currentTestIndex}`}
                        userId={testerId}
                        issueLink={gitHubIssueLinkWithTitleAndBody}
                        handleClose={() => setShowReviewConflictsModal(false)}
                    />
                )}
            </>
        );
    };

    let heading;
    let content;
    let openAsUserHeading = null;

    if (openAsUserId) {
        const openAsUser = users.find(user => user.id === openAsUserId);
        openAsUserHeading = (
            <>
                <div className="test-info-entity reviewing-as">
                    Reviewing tests of <b>{`${openAsUser.username}`}.</b>
                    <p>{`All changes will be saved as performed by ${openAsUser.username}.`}</p>
                </div>
            </>
        );
    }

    heading = (
        <>
            <div className="test-info-wrapper">
                <div
                    className="test-info-entity apg-example-name"
                    data-test="apg-example-name"
                >
                    <div className="info-label">
                        <b>Test Plan:</b>{' '}
                        {`${testPlanVersion.title ||
                            testPlanVersion.testPlan?.directory ||
                            ''}`}
                    </div>
                </div>
                <div
                    className="test-info-entity at-browser"
                    data-test="at-browser"
                >
                    <div className="info-label">
                        <b>AT:</b>{' '}
                        {`${testPlanReport.at?.name} ${currentAtVersion.name}`}
                    </div>
                    <div className="info-label">
                        <b>Browser:</b>{' '}
                        {`${testPlanReport.browser?.name} ${currentBrowserVersion.name}`}
                    </div>
                </div>
                <div className="test-info-entity tests-completed">
                    <div className="info-label">
                        <FontAwesomeIcon
                            icon={hasTestsToRun ? faCheck : faExclamationCircle}
                        />
                        {!isSignedIn ? (
                            <>
                                <b>{tests.length} tests to view</b>
                            </>
                        ) : hasTestsToRun ? (
                            <>
                                {' '}
                                <b>{`${testPlanRun.testResults.reduce(
                                    (acc, { completedAt }) =>
                                        acc + (completedAt ? 1 : 0),
                                    0
                                )} of ${tests.length}`}</b>{' '}
                                tests completed
                            </>
                        ) : (
                            <div>
                                No tests for this AT and Browser combination
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {openAsUserHeading}
        </>
    );

    if (!isSignedIn || !testPlanRun?.isComplete) {
        content = hasTestsToRun ? (
            renderTestContent(testPlanReport, currentTest, heading)
        ) : (
            // No tests loaded
            <>
                {heading}
                <div>No tests for this At and Browser combination</div>
            </>
        );
    } else {
        content = (
            <div>
                {heading}
                <Row>
                    <Alert key={nextId()} variant="success">
                        <FontAwesomeIcon icon={faCheck} /> Thanks! Your results
                        have been submitted. Please return to the{' '}
                        <Link to="/test-queue">Test Queue</Link>.
                    </Alert>
                </Row>
            </div>
        );
    }

    const handleAtAndBrowserDetailsModalAction = async (
        updatedAtVersionName,
        updatedBrowserVersionName
    ) => {
        // Get version id for selected atVersion and browserVersion from name
        const atVersions = ats.find(item => item.id === testPlanReport.at.id)
            .atVersions;
        const atVersionId = atVersions.find(
            item => item.name === updatedAtVersionName
        ).id;

        const browserVersions = browsers.find(
            item => item.id === testPlanReport.browser.id
        ).browserVersions;
        const browserVersionId = browserVersions.find(
            item => item.name === updatedBrowserVersionName
        ).id;

        setAtVersionId(atVersionId);
        setBrowserVersionId(browserVersionId);

        await createTestResultForRenderer(
            currentTest.id,
            atVersionId,
            browserVersionId
        );
        setIsFirstPageLoad(false);
    };

    const atVersions = getVersionsForResource(
        ats,
        testPlanReport.at.name,
        'atVersions'
    );
    const browserVersions = getVersionsForResource(
        browsers,
        testPlanReport.browser.name,
        'browserVersions'
    );

    return (
        <Container className="test-run-container">
            <Helmet>
                <title>
                    {hasTestsToRun
                        ? `${currentTest.title} for ${testPlanReport.at?.name} ${currentAtVersion.name} and ${testPlanReport.browser?.name} ${currentBrowserVersion.name} ` +
                          `| ARIA-AT`
                        : 'No tests for this AT and Browser | ARIA-AT'}
                </title>
            </Helmet>
            <Row>
                <TestNavigator
                    show={showTestNavigator}
                    tests={tests}
                    currentTestIndex={currentTestIndex}
                    toggleShowClick={toggleTestNavigator}
                    handleTestClick={handleTestClick}
                />
                <Col
                    className="main-test-area"
                    id="main"
                    as="main"
                    tabIndex="-1"
                >
                    <Row>
                        <Col>{content}</Col>
                    </Row>
                </Col>
            </Row>
            {isSignedIn && (
                // && just loaded TestRun
                <AtAndBrowserDetailsModal
                    show={isFirstPageLoad}
                    isAdmin={isAdmin && openAsUserId}
                    atName={testPlanReport.at.name}
                    atVersion={
                        testPlanRun.atVersion?.name || atVersions[0]?.name
                    }
                    atVersions={atVersions.map(item => item.name)}
                    browserName={testPlanReport.browser.name}
                    browserVersion={
                        testPlanRun.browserVersion?.name ||
                        browserVersions[0]?.name
                    }
                    browserVersions={browserVersions.map(item => item.name)}
                    patternName={testPlanVersion.title}
                    testerName={tester.username}
                    handleAction={handleAtAndBrowserDetailsModalAction}
                    handleClose={() => setIsFirstPageLoad(false)}
                />
            )}
        </Container>
    );
};

export { createGitHubIssueWithTitleAndBody };
export default TestRun;
