import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
import {
    TEST_RUN_PAGE_QUERY,
    CREATE_TEST_RESULT_MUTATION,
    SAVE_TEST_RESULT_MUTATION,
    SUBMIT_TEST_RESULT_MUTATION,
    DELETE_TEST_RESULT_MUTATION
} from './queries';
import './TestRun.css';

const TestRun = ({ auth }) => {
    const params = useParams();
    const history = useHistory();
    const routerQuery = useRouterQuery();
    const titleRef = useRef();

    const pageReadyRef = useRef(false);
    const testRunStateRef = useRef();
    const testRunResultRef = useRef();
    const testRendererSubmitButtonRef = useRef();

    const { runId: testPlanRunId } = params;

    const { loading, data, error, refetch } = useQuery(TEST_RUN_PAGE_QUERY, {
        variables: { testPlanRunId }
    });
    const [createTestResult, { loading: createTestLoading }] = useMutation(
        CREATE_TEST_RESULT_MUTATION
    );
    const [saveTestResult] = useMutation(SAVE_TEST_RESULT_MUTATION);
    const [submitTestResult] = useMutation(SUBMIT_TEST_RESULT_MUTATION);
    const [deleteTestResult] = useMutation(DELETE_TEST_RESULT_MUTATION);

    const [isTestSubmitClicked, setIsTestSubmitClicked] = useState(false);
    const [showTestNavigator, setShowTestNavigator] = useState(true);
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [showStartOverModal, setShowStartOverModal] = useState(false);
    const [showRaiseIssueModal, setShowRaiseIssueModal] = useState(false);
    const [showReviewConflictsModal, setShowReviewConflictsModal] = useState(
        false
    );

    useEffect(() => {
        pageReadyRef.current = false;
        testRunStateRef.current = null;
        testRunResultRef.current = null;
        setIsTestSubmitClicked(false);

        if (titleRef.current) titleRef.current.focus();
    }, [currentTestIndex]);

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

    const { testPlanRun, users } = data;
    const { testPlanReport, tester, testResults = [] } = testPlanRun || {};
    const {
        testPlanTarget,
        testPlanVersion,
        runnableTests = [],
        conflicts = [],
        conflictsFormatted
    } = testPlanReport || {};

    const { id: userId } = auth;
    // check to ensure an admin that manually went to a test run url doesn't
    // run the test as themselves
    const openAsUserId =
        routerQuery.get('user') || (tester && tester.id !== userId)
            ? tester.id
            : null;
    const testerId = openAsUserId || userId;

    if (!testPlanRun || !testPlanTarget) {
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

    const createTestResultForRenderer = async testId => {
        await createTestResult({
            variables: {
                testPlanRunId,
                testId
            }
        });
        pageReadyRef.current = true;
        await refetch();
    };

    /**
     * Check to see if scenarioId and scenarioResultId
     * exists in source.locationOfData and
     * conflictingResults.locationOfData objects
     * respectively. If it does exist, check to see if
     * scenarioId/scenarioTestId exists in the current
     * test.
     */
    const conflictScenarioIds = [];

    for (let i = 0; i < conflicts.length; i++) {
        const conflict = conflicts[i];
        if (
            conflict.source &&
            conflict.source.locationOfData &&
            conflict.source.locationOfData.scenarioId
        )
            conflictScenarioIds.push(conflict.source.locationOfData.scenarioId);

        if (conflict.conflictingResults) {
            for (let j = 0; j < conflict.conflictingResults.length; j++) {
                const conflictingResult = conflict.conflictingResults[j];
                if (
                    conflictingResult.locationOfData &&
                    conflictingResult.locationOfData.scenarioResultId
                )
                    conflictScenarioIds.push(
                        conflictingResult.locationOfData.scenarioResultId
                    );
            }
        }
    }

    const tests = runnableTests.map((test, index) => ({
        ...test,
        index,
        seq: index + 1,
        testResult: testResults.find(t => t.test.id === test.id),
        hasConflicts: test.scenarios.some(({ id }) =>
            conflictScenarioIds.includes(id)
        )
    }));
    const currentTest = tests[currentTestIndex];
    const hasTestsToRun = tests.length;

    if (!currentTest.testResult && !pageReadyRef.current)
        (async () => await createTestResultForRenderer(currentTest.id))();
    else pageReadyRef.current = true;

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

    const mergeResults = (rendererState, scenarioResults) => {
        // console.info('mergeResults', rendererState, scenarioResults);
        let newScenarioResults = [];
        if (!rendererState || !scenarioResults)
            throw new Error('Unable to merge invalid results');

        const { commands } = rendererState;
        if (!commands || commands.length !== scenarioResults.length)
            throw new Error('Unable to merge invalid results');

        for (let i = 0; i < commands.length; i++) {
            let scenarioResult = { ...scenarioResults[i] };
            let assertionResults = [];
            let unexpectedBehaviors = [];

            // collect variables
            const { atOutput, assertions, unexpected } = commands[i];

            // process assertion results
            for (let j = 0; j < assertions.length; j++) {
                const { result } = assertions[j];
                assertionResults.push({
                    ...scenarioResult.assertionResults[j],
                    passed: result === 'pass',
                    failedReason:
                        result === 'failMissing'
                            ? 'NO_OUTPUT'
                            : result === 'failIncorrect'
                            ? 'INCORRECT_OUTPUT'
                            : null
                });
            }

            // process unexpected behaviors
            const { hasUnexpected, behaviors } = unexpected;
            if (hasUnexpected === 'hasUnexpected') {
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
                        if (i === 5)
                            unexpectedBehaviors.push({
                                id: 'OTHER',
                                otherUnexpectedBehaviorText: behavior.more.value
                            });
                    }
                }
            }

            // re-assign scenario result due to read only values
            scenarioResult.output = atOutput.value ? atOutput.value : null;
            scenarioResult.assertionResults = [...assertionResults];
            scenarioResult.unexpectedBehaviors = [...unexpectedBehaviors];

            newScenarioResults.push(scenarioResult);
        }

        return newScenarioResults;
    };

    const performButtonAction = async (action, index) => {
        const saveForm = async () => {
            const scenarioResults = mergeResults(
                testRunStateRef.current,
                currentTest.testResult.scenarioResults
            );

            await handleSaveOrSubmitTestResultAction(
                { scenarioResults },
                testRunResultRef.current
            );
            return true;
        };

        switch (action) {
            case 'goToTestAtIndex': {
                // Save renderer's form state
                await saveForm();
                setCurrentTestIndex(index);
                break;
            }
            case 'goToNextTest': {
                // Save renderer's form state
                await saveForm();
                navigateTests();
                break;
            }
            case 'goToPreviousTest': {
                // Save renderer's form state
                await saveForm();
                navigateTests(true);
                break;
            }
            case 'editTest': {
                await handleStartOverAction();
                if (titleRef.current) titleRef.current.focus();
                break;
            }
            case 'saveTest': {
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

    const handleRaiseIssueButtonClick = async () => {
        setShowRaiseIssueModal(!showRaiseIssueModal);
        setShowReviewConflictsModal(false);
    };

    const handleStartOverButtonClick = async () => setShowStartOverModal(true);

    const handleStartOverAction = async () => {
        const { id } = currentTest.testResult;
        let variables = {
            id
        };
        await deleteTestResult({ variables });
        await refetch();

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

    const renderTestContent = (testPlanReport, test, heading) => {
        const { index } = test;
        const isComplete = test.testResult
            ? !!test.testResult.completedAt
            : false;
        const isFirstTest = index === 0;
        const isLastTest = currentTest.seq === tests.length;

        let primaryButtons = []; // These are the list of buttons that will appear below the tests
        let forwardButtons = []; // These are buttons that navigate to next tests and continue

        const nextButton = (
            <Button
                key="nextButton"
                variant="secondary"
                onClick={handleNextTestClick}
            >
                Next Test
            </Button>
        );

        const previousButton = (
            <Button
                key="previousButton"
                variant="secondary"
                onClick={handlePreviousTestClick}
                className="testrun__button-right"
                disabled={isFirstTest}
            >
                Previous Test
            </Button>
        );

        if (isComplete) {
            const editButton = (
                <Button
                    key="editButton"
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
                    key="continueButton"
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
                <Button
                    key="continueButton"
                    variant="primary"
                    onClick={handleSaveClick}
                >
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

        const primaryButtonGroup = (
            <div className="testrun__button-toolbar-group">
                {primaryButtons}
            </div>
        );

        const menuRightOfContent = (
            <div role="complementary">
                <h3>Test Options</h3>
                <div className="options-wrapper">
                    <OptionButton
                        text="Raise An Issue"
                        icon={<FontAwesomeIcon icon={faExclamationCircle} />}
                        onClick={handleRaiseIssueButtonClick}
                    />

                    <OptionButton
                        text="Start Over"
                        icon={<FontAwesomeIcon icon={faRedo} />}
                        onClick={handleStartOverButtonClick}
                    />

                    <OptionButton
                        text="Save and Close"
                        onClick={handleCloseRunClick}
                    />

                    <div className="help-link">
                        Need Help?{' '}
                        <a href="mailto:public-aria-at@w3.org">Email Us</a>
                    </div>
                </div>
            </div>
        );

        return (
            <>
                <h1 ref={titleRef} data-test="testing-task" tabIndex={-1}>
                    <span className="task-label">Testing task:</span>{' '}
                    {`${currentTest.seq}.`} {test.title}
                </h1>
                <span>{heading}</span>
                <StatusBar
                    key={nextId()}
                    hasConflicts={currentTest.hasConflicts}
                    conflictsFormatted={conflictsFormatted}
                    handleReviewConflictsButtonClick={
                        handleReviewConflictsButtonClick
                    }
                    handleRaiseIssueButtonClick={handleRaiseIssueButtonClick}
                />
                <Row>
                    <Col className="test-iframe-container" md={9}>
                        <Row>
                            {pageReadyRef.current && currentTest.testResult && (
                                <TestRenderer
                                    key={`TestRenderer__${currentTestIndex}`}
                                    at={testPlanTarget.at}
                                    testResult={currentTest.testResult}
                                    testPageUrl={testPlanVersion.testPageUrl}
                                    testRunStateRef={testRunStateRef}
                                    testRunResultRef={testRunResultRef}
                                    submitButtonRef={
                                        testRendererSubmitButtonRef
                                    }
                                    isSubmitted={isTestSubmitClicked}
                                />
                            )}
                        </Row>
                        <Row>{primaryButtonGroup}</Row>
                    </Col>
                    <Col className="current-test-options" md={3}>
                        {menuRightOfContent}
                    </Col>
                </Row>

                {/* Modals */}
                {showStartOverModal && (
                    <BasicModal
                        key={`BasicModal__${currentTestIndex}`}
                        show={showStartOverModal}
                        centered={true}
                        animation={false}
                        details={{
                            title: 'Start Over',
                            description: `Are you sure you want to start over Test #${currentTest.seq}? Your progress (if any), will be lost.`
                        }}
                        handleAction={handleStartOverAction}
                        handleClose={() => setShowStartOverModal(false)}
                    />
                )}
                {/*
                TODO: This is handled in other PRs
                {showRaiseIssueModal && (
                    <RaiseIssueModal
                        key={`RaiseIssueModal__${currentTestIndex}`}
                        show={showRaiseIssueModal}
                        userId={testerId}
                        test={currentTest}
                        testPlanRun={testPlanRun}
                        // conflicts={conflicts[currentTestIndex]}
                        handleUpdateTestPlanRunResultAction={
                            handleUpdateTestPlanRunResultAction
                        }
                        handleClose={() => setShowRaiseIssueModal(false)}
                    />
                )}*/}
                {showReviewConflictsModal && (
                    <ReviewConflictsModal
                        key={`ReviewConflictsModal__${currentTestIndex}`}
                        show={showReviewConflictsModal}
                        userId={testerId}
                        conflictsFormatted={conflictsFormatted}
                        handleClose={() => setShowReviewConflictsModal(false)}
                        handleRaiseIssueButtonClick={
                            handleRaiseIssueButtonClick
                        }
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
                            testPlanVersion.directory}`}
                    </div>
                </div>
                <div
                    className="test-info-entity at-browser"
                    data-test="at-browser"
                >
                    <div className="info-label">
                        <b>AT and Browser:</b> {`${testPlanTarget.title}`}
                    </div>
                </div>
                <div className="test-info-entity tests-completed">
                    <div className="info-label">
                        <FontAwesomeIcon
                            icon={hasTestsToRun ? faCheck : faExclamationCircle}
                        />
                        {hasTestsToRun ? (
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

    if (!testPlanRun.isComplete) {
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

    return (
        <Container className="test-run-container">
            <Helmet>
                <title>{testPlanTarget.title}</title>
            </Helmet>
            <Row>
                <TestNavigator
                    show={showTestNavigator}
                    tests={tests}
                    currentTestIndex={currentTestIndex}
                    toggleShowClick={toggleTestNavigator}
                    handleTestClick={handleTestClick}
                />
                <Col className="main-test-area" as="main">
                    <Row>
                        <Col>{content}</Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

TestRun.propTypes = {
    auth: PropTypes.object
};

const mapStateToProps = state => {
    const { auth } = state;
    return { auth };
};

export default connect(mapStateToProps)(TestRun);
