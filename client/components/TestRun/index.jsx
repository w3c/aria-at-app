import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useRouterQuery from '../../hooks/useRouterQuery';
import { useMutation, useQuery } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPen,
    faEdit,
    faRedo,
    faCheck,
    faCheckCircle,
    faExclamationCircle,
    faRobot
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
import BasicThemedModal from '../common/BasicThemedModal';
import AtAndBrowserDetailsModal from '../common/AtAndBrowserDetailsModal';
import { useDetectUa } from '../../hooks/useDetectUa';
import DisplayNone from '../../utils/DisplayNone';
import { navigateTests } from '../../utils/navigateTests';
import {
    COLLECTION_JOB_STATUS_BY_TEST_PLAN_RUN_ID_QUERY,
    DELETE_TEST_RESULT_MUTATION,
    FIND_OR_CREATE_BROWSER_VERSION_MUTATION,
    FIND_OR_CREATE_TEST_RESULT_MUTATION,
    SAVE_TEST_RESULT_MUTATION,
    SUBMIT_TEST_RESULT_MUTATION,
    TEST_RUN_PAGE_ANON_QUERY,
    TEST_RUN_PAGE_QUERY
} from './queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import './TestRun.css';
import ReviewConflicts from '../ReviewConflicts';
import createIssueLink from '../../utils/createIssueLink';
import { convertDateToString } from '../../utils/formatter';
import { isBot } from '../../utils/automation';

const TestRun = () => {
    const params = useParams();
    const navigate = useNavigate();
    const routerQuery = useRouterQuery();

    // Detect UA information
    const { uaBrowser, uaMajor } = useDetectUa();

    const titleRef = useRef();
    // To prevent default AT/Browser versions being set before initial
    // AT & Browser Details Modal is saved
    const testRunStateRef = useRef();
    // HACK: Temporary fix to allow for consistency of TestRenderer after
    // testRunStateRef is nullified during unmount.
    // See 'unmount' of 'pageContent' hook in the TestRenderer component
    const recentTestRunStateRef = useRef();
    const testRunResultRef = useRef();
    const testRendererSubmitButtonRef = useRef();
    const conflictMarkdownRef = useRef();
    const adminReviewerCheckedRef = useRef(false);
    const adminReviewerOriginalTestRef = useRef();
    const editAtBrowserDetailsButtonRef = useRef();

    const { runId: testPlanRunId, testPlanReportId } = params;

    const { loading, data, error } = useQuery(
        testPlanRunId ? TEST_RUN_PAGE_QUERY : TEST_RUN_PAGE_ANON_QUERY,
        {
            fetchPolicy: 'cache-and-network',
            variables: { testPlanRunId, testPlanReportId }
        }
    );

    const { data: collectionJobQuery } = useQuery(
        COLLECTION_JOB_STATUS_BY_TEST_PLAN_RUN_ID_QUERY,
        {
            variables: { testPlanRunId },
            fetchPolicy: 'cache-and-network'
        }
    );

    const [createTestResult, { loading: createTestResultLoading }] =
        useMutation(FIND_OR_CREATE_TEST_RESULT_MUTATION);
    const [saveTestResult] = useMutation(SAVE_TEST_RESULT_MUTATION);
    const [submitTestResult] = useMutation(SUBMIT_TEST_RESULT_MUTATION);
    const [deleteTestResult] = useMutation(DELETE_TEST_RESULT_MUTATION);
    const [createBrowserVersion] = useMutation(
        FIND_OR_CREATE_BROWSER_VERSION_MUTATION
    );

    const [isRendererReady, setIsRendererReady] = useState(false);
    const [isSavingForm, setIsSavingForm] = useState(false);
    const [isTestSubmitClicked, setIsTestSubmitClicked] = useState(false);
    const [isTestEditClicked, setIsTestEditClicked] = useState(false);
    const [showTestNavigator, setShowTestNavigator] = useState(true);
    const [showStartOverModal, setShowStartOverModal] = useState(false);
    const [showReviewConflictsModal, setShowReviewConflictsModal] =
        useState(false);
    const [showGetInvolvedModal, setShowGetInvolvedModal] = useState(false);

    // Modal State Values
    const [isShowingAtBrowserModal, setIsShowingAtBrowserModal] =
        useState(true);
    const [showThemedModal, setShowThemedModal] = useState(false);
    const [themedModalTitle, setThemedModalTitle] = useState('');
    const [themedModalContent, setThemedModalContent] = useState(<></>);
    const [themedModalOtherButton, setThemedModalOtherButton] = useState(null);
    const [isEditAtBrowserDetailsModalClick, setIsEditAtBrowserDetailsClicked] =
        useState(false);
    const [updateMessageComponent, setUpdateMessageComponent] = useState(null);

    // Queried State Values
    const [testPlanRun, setTestPlanRun] = useState({});
    const [users, setUsers] = useState([]);
    const [tester, setTester] = useState();
    const [tests, setTests] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [testPlanReport, setTestPlanReport] = useState({});
    const [testPlanVersion, setTestPlanVersion] = useState();
    const [currentTest, setCurrentTest] = useState({});
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [currentTestAtVersionId, setCurrentTestAtVersionId] = useState('');
    const [currentTestBrowserVersionId, setCurrentTestBrowserVersionId] =
        useState('');
    const [currentAtVersion, setCurrentAtVersion] = useState('');
    const [currentBrowserVersion, setCurrentBrowserVersion] = useState('');
    const [pageReady, setPageReady] = useState(false);

    const auth = evaluateAuth(data && data.me ? data.me : {});
    let { id: userId, isSignedIn, isAdmin } = auth;

    // if a signed in user navigates to this page, treat them as anon to prevent
    // invalid save attempts
    if (testPlanReportId) isSignedIn = false;

    // check to ensure an admin that manually went to a test run url doesn't
    // run the test as themselves
    const openAsUserId =
        routerQuery.get('user') || (tester && tester.id !== userId)
            ? tester?.id
            : null;
    const testerId = openAsUserId || userId;
    const isAdminReviewer = !!(isAdmin && openAsUserId);
    const openAsUser = users?.find(user => user.id === openAsUserId);

    useEffect(() => {
        if (data) setup(data);
    }, [data]);

    useEffect(() => {
        reset();

        // Set up for the current test
        const currentTest = tests[currentTestIndex];
        if (currentTest) {
            setPageReady(false);
            if (isSignedIn) {
                (async () => {
                    const { testPlanRun, testPlanReport } =
                        await createTestResultForRenderer(
                            currentTest.id,
                            currentTestAtVersionId,
                            currentTestBrowserVersionId
                        );
                    updateLocalState(testPlanRun, testPlanReport);
                    setPageReady(true);
                })();
            } else {
                // To account for ANON viewing
                setCurrentTest(tests[currentTestIndex]);
                setPageReady(true);
            }
        } else if (data) setup(data);
    }, [currentTestIndex]);

    const setup = data => {
        const { testPlanRun, users } = data;
        const { tester, testResults = [] } = testPlanRun || {};
        let { testPlanReport } = testPlanRun || {};

        // if a signed in user navigates to this page, treat them as anon to prevent
        // invalid save attempts
        if (testPlanReportId) isSignedIn = false;
        if (!isSignedIn) testPlanReport = data.testPlanReport;

        const {
            testPlanVersion,
            runnableTests = [],
            conflicts = []
        } = testPlanReport || {};

        const tests = runnableTests.map((test, index) => ({
            ...test,
            index,
            seq: index + 1,
            testResult: testResults.find(t => t.test.id === test.id),
            hasConflicts: !!conflicts.find(c => c.source.test.id === test.id)
        }));
        const currentTest = tests[currentTestIndex];

        // Capture the AT & Browser Versions
        const defaultAtVersionId = testPlanReport.at.atVersions[0].id;
        const defaultBrowserVersionId =
            testPlanReport.browser.browserVersions[0].id;

        const currentTestAtVersionId =
            currentTest.testResult?.atVersion?.id || defaultAtVersionId;

        const currentTestBrowserVersionId =
            currentTest.testResult?.browserVersion?.id ||
            defaultBrowserVersionId;

        const currentAtVersion =
            currentTest.testResult?.atVersion ||
            testPlanReport.at.atVersions.find(
                item => item.id === currentTestAtVersionId
            ) ||
            'N/A';

        let currentBrowserVersion =
            currentTest.testResult?.browserVersion ||
            testPlanReport.browser.browserVersions.find(
                item => item.id === currentTestBrowserVersionId
            ) ||
            'N/A';

        // Only show major version of browser
        currentBrowserVersion = {
            id: currentAtVersion.id,
            name: currentBrowserVersion.name.split('.')[0]
        };

        // Auto batch the states
        setUsers(users);
        setTester(tester);
        setTestPlanRun(testPlanRun);
        setTestPlanReport(testPlanReport);
        setTestPlanVersion(testPlanVersion);
        setTests(tests);
        setTestResults(testResults);
        setCurrentTest(currentTest);
        setCurrentTestAtVersionId(currentTestAtVersionId);
        setCurrentTestBrowserVersionId(currentTestBrowserVersionId);
        setCurrentAtVersion(currentAtVersion);
        setCurrentBrowserVersion(currentBrowserVersion);
        // Testers do not need to change AT/Browser versions
        // while assigning verdicts for previously automated tests
        if (testPlanRun?.initiatedByAutomation) {
            setIsShowingAtBrowserModal(false);
        }
        setPageReady(true);
    };

    const reset = () => {
        testRunStateRef.current = null;
        recentTestRunStateRef.current = null;
        testRunResultRef.current = null;
        conflictMarkdownRef.current = null;

        setPageReady(false);
        setIsRendererReady(false);
        setIsTestSubmitClicked(false);

        if (titleRef.current) titleRef.current.focus();
    };

    const updateLocalState = (updatedTestPlanRun, updatedTestPlanReport) => {
        const { conflicts, runnableTests } = updatedTestPlanReport;

        const testResults = updatedTestPlanRun.testResults;
        const tests = runnableTests.map((test, index) => ({
            ...test,
            index,
            seq: index + 1,
            testResult: testResults.find(t => t.test.id === test.id),
            hasConflicts: !!conflicts.find(c => c.source.test.id === test.id)
        }));

        setTests(tests);
        setTestResults(testResults);
        setCurrentTest(tests[currentTestIndex]);
        setTestPlanReport({ ...testPlanReport, conflicts });
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

    if (!data || loading || createTestResultLoading || isSavingForm) {
        return (
            <PageStatus
                title="Loading - Test Results | ARIA-AT"
                heading="Testing Task"
            />
        );
    }

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
        const result = await createTestResult({
            variables: {
                testPlanRunId,
                testId,
                atVersionId,
                browserVersionId
            }
        });
        return result.data.testPlanRun.findOrCreateTestResult;
    };

    // Check to see if there are tests to run
    const hasTestsToRun = tests.length;

    // Check if this test is being run as an admin
    if (
        adminReviewerOriginalTestRef.current &&
        adminReviewerOriginalTestRef.current !== currentTest.id
    )
        adminReviewerCheckedRef.current = false;

    if (
        isAdminReviewer &&
        currentTest.testResult &&
        !adminReviewerCheckedRef.current
    )
        adminReviewerOriginalTestRef.current = currentTest;

    adminReviewerCheckedRef.current = true;

    let issueLink;
    const hasLoadingCompleted = Object.keys(currentTest).length;
    if (hasLoadingCompleted) {
        issueLink = createIssueLink({
            testPlanTitle: testPlanVersion.title,
            testPlanDirectory: testPlanVersion.testPlan.directory,
            versionString: `V${convertDateToString(
                testPlanVersion.updatedAt,
                'YY.MM.DD'
            )}`,
            testTitle: currentTest.title,
            testRowNumber: currentTest.rowNumber,
            testRenderedUrl: currentTest.renderedUrl,
            atName: testPlanReport.at.name,
            browserName: testPlanReport.browser.name,
            atVersionName: currentAtVersion?.name,
            browserVersionName: currentBrowserVersion?.name,
            conflictMarkdown: conflictMarkdownRef.current
        });
    }

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
                `Unable to merge invalid results:commands:${commands} | commands.length !== scenarioResults.length:${
                    commands.length !== scenarioResults.length
                }`
            );
        }

        const UnexpectedBehaviorsArray = [
            'EXCESSIVELY_VERBOSE',
            'UNEXPECTED_CURSOR_POSITION',
            'SLUGGISH',
            'AT_CRASHED',
            'BROWSER_CRASHED',
            'OTHER'
        ];

        for (let i = 0; i < commands.length; i++) {
            let scenarioResult = { ...scenarioResults[i] };
            let assertionResults = [];
            let unexpectedBehaviors = null;

            // collect variables
            const { atOutput, assertions, unexpected } = commands[i];

            // process assertion results
            for (let j = 0; j < assertions.length; j++) {
                const { description, result, highlightRequired } =
                    assertions[j];
                const assertionResult = {
                    ...scenarioResult.assertionResults.find(
                        ({ assertion: { text } }) => text === description
                    ),
                    passed: result === 'pass'
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
                        unexpectedBehaviors.push({
                            id: UnexpectedBehaviorsArray[i],
                            text: behavior.description,
                            details: behavior.more.value,
                            impact: behavior.impact.toUpperCase(),
                            highlightRequired: captureHighlightRequired
                                ? behavior.more.highlightRequired
                                : false
                        });
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
                scenarioResult.unexpectedBehaviorHighlightRequired =
                    highlightRequired;

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
            if (updateMessageComponent) {
                setUpdateMessageComponent(null);
            }
            try {
                if (forceEdit) setIsTestEditClicked(true);
                else setIsTestEditClicked(false);

                if (!isSignedIn) return true;
                if (!forceEdit && currentTest.testResult?.completedAt)
                    return true;

                setIsSavingForm(true);
                const scenarioResults = remapScenarioResults(
                    testRunStateRef.current || recentTestRunStateRef.current,
                    currentTest.testResult?.scenarioResults,
                    false
                );

                await handleSaveOrSubmitTestResultAction(
                    {
                        atVersionId: currentTestAtVersionId,
                        browserVersionId: currentTestBrowserVersionId,
                        scenarioResults
                    },
                    forceSave ? false : !!testRunResultRef.current
                );

                if (withResult && !forceSave) {
                    setIsSavingForm(false);
                    return !!testRunResultRef.current;
                }

                setIsSavingForm(false);
                return true;
            } catch (e) {
                console.error('save.error', e);
                setIsSavingForm(false);
            }
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
                navigateTests(false, currentTest, tests, setCurrentTestIndex);
                break;
            }
            case 'goToPreviousTest': {
                // Save renderer's form state
                await saveForm(false, true);
                navigateTests(true, currentTest, tests, setCurrentTestIndex);
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
                navigate('/test-queue');
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

    const handleEditResultsClick = async () => performButtonAction('editTest');

    const handleStartOverButtonClick = async () => setShowStartOverModal(true);

    const handleStartOverAction = async () => {
        const { id } = currentTest.testResult;
        let variables = {
            id
        };
        await deleteTestResult({ variables });

        reset();
        setPageReady(false);
        const { testPlanRun, testPlanReport } =
            await createTestResultForRenderer(
                currentTest.id,
                currentTestAtVersionId,
                currentTestBrowserVersionId
            );
        updateLocalState(testPlanRun, testPlanReport);
        setPageReady(true);

        // close modal after action
        setShowStartOverModal(false);
    };

    const handleSaveOrSubmitTestResultAction = async (
        { atVersionId, browserVersionId, scenarioResults = [] },
        isSubmit = false
    ) => {
        const { id } = currentTest.testResult;

        /*
         * The shape of scenarioResults should be:
         *
         * {
         * ..id,
         * ..output,
         * ..assertionResults: [
         * ....{
         * ......id
         * ......passed
         * ....},
         * ....other assertionResults,
         * ..],
         * ..unexpectedBehaviors: [
         * ....{
         * ......id
         * ......impact
         * ......details
         * ....},
         * ....other unexpectedBehaviors,
         * ..]
         * }
         * */
        const formattedScenarioResults = scenarioResults.map(
            ({ assertionResults, id, output, unexpectedBehaviors }) => ({
                id,
                output: output,
                unexpectedBehaviors: unexpectedBehaviors?.map(
                    ({ id, impact, details }) => ({
                        id,
                        impact,
                        details
                    })
                ),
                assertionResults: assertionResults
                    // All assertions are always being passed from the TestRenderer results, but
                    // when there is a 0-priority assertion exception, an id won't be provided,
                    // so do not include that result.
                    // This is due to the TestRenderer still requiring the position of the
                    // excluded assertion, but it can be removed at this point before being passed
                    // to the server
                    .filter(el => !!el.id)
                    .map(({ id, passed }) => ({
                        id,
                        passed
                    }))
            })
        );

        let variables = {
            id,
            atVersionId,
            browserVersionId,
            scenarioResults: formattedScenarioResults
        };

        if (isSubmit) {
            const result = await submitTestResult({ variables });
            const { testPlanRun, testPlanReport } =
                result.data.testResult.submitTestResult;
            updateLocalState(testPlanRun, testPlanReport);
        } else {
            const result = await saveTestResult({ variables });
            const { testPlanRun, testPlanReport } =
                result.data.testResult.saveTestResult;
            updateLocalState(testPlanRun, testPlanReport);
        }
    };

    const handleReviewConflictsButtonClick = async () =>
        setShowReviewConflictsModal(true);

    const handleEditAtBrowserDetailsClick = async () => {
        setIsEditAtBrowserDetailsClicked(true);

        if (isAdminReviewer && adminReviewerOriginalTestRef.current) {
            if (testPlanReport.browser.name !== uaBrowser) {
                setThemedModalTitle(
                    'Your Browser is different than the one used to record this result'
                );
                setThemedModalContent(
                    <>
                        You are currently using{' '}
                        <b>
                            {uaBrowser} {uaMajor}
                        </b>
                        , but are trying to edit a test result that was
                        submitted with{' '}
                        <b>
                            {testPlanReport.browser.name}{' '}
                            {
                                adminReviewerOriginalTestRef.current.testResult
                                    .browserVersion.name
                            }
                        </b>
                        .<br />
                        <br />
                        You can&apos;t change the Browser type but can make
                        other changes. Please proceed with caution.
                    </>
                );
                setThemedModalOtherButton(null);
                setShowThemedModal(true);
                return;
            }

            if (
                currentTest.testResult?.atVersion?.name !==
                adminReviewerOriginalTestRef.current.testResult?.atVersion?.name
            ) {
                setThemedModalTitle(
                    'Your AT Version is different than the one used to record this result'
                );
                setThemedModalContent(
                    <>
                        You are currently running{' '}
                        <b>
                            {testPlanReport.at.name}{' '}
                            {currentTest.testResult?.atVersion?.name}
                        </b>
                        , but are editing a test result that was submitted with{' '}
                        <b>
                            {testPlanReport.at.name}{' '}
                            {
                                adminReviewerOriginalTestRef.current.testResult
                                    ?.atVersion?.name
                            }
                        </b>
                        .<br />
                        <br />
                        Do you want to update the AT version used to record this
                        test result?
                    </>
                );
                setThemedModalOtherButton({
                    text: 'Update AT Version',
                    action: () => {
                        setShowThemedModal(false);
                        setIsShowingAtBrowserModal(true);
                    }
                });
                setShowThemedModal(true);
                return;
            }

            if (
                !adminReviewerOriginalTestRef.current.testResult?.browserVersion?.name.includes(
                    `${uaMajor}`
                )
            ) {
                setThemedModalTitle(
                    'Your Browser Version is different than the one used to record this result'
                );
                setThemedModalContent(
                    <>
                        You are currently using{' '}
                        <b>
                            {uaBrowser} {uaMajor}
                        </b>
                        , but are trying to edit a test result that was
                        submitted with{' '}
                        <b>
                            {testPlanReport.browser.name}{' '}
                            {
                                adminReviewerOriginalTestRef.current.testResult
                                    ?.browserVersion?.name
                            }
                        </b>
                        .<br />
                        <br />
                        Do you want to update the Browser version used to record
                        this test result?
                    </>
                );
                setThemedModalOtherButton({
                    text: 'Update Browser Version',
                    action: () => {
                        setShowThemedModal(false);
                        setIsShowingAtBrowserModal(true);
                    }
                });
                setShowThemedModal(true);
                return;
            }
        }
        setIsShowingAtBrowserModal(true);
    };

    const handleAtAndBrowserDetailsModalAction = async (
        updatedAtVersionName,
        updatedBrowserVersionName,
        updateMessage
    ) => {
        // Get version id for selected atVersion and browserVersion from name
        const atVersion = testPlanReport.at.atVersions.find(
            item => item.name === updatedAtVersionName
        );

        let browserVersion = testPlanReport.browser.browserVersions.find(
            item => item.name === updatedBrowserVersionName
        );

        // create version if not exists (accounting for admin providing new versions)
        if (!browserVersion) {
            const createBrowserVersionResult = await createBrowserVersion({
                variables: {
                    browserId: testPlanReport.browser.id,
                    browserVersionName: updatedBrowserVersionName
                }
            });
            browserVersion =
                createBrowserVersionResult.data?.browser
                    ?.findOrCreateBrowserVersion;
        }

        // Only show major browser version
        browserVersion = {
            id: browserVersion.id,
            name: browserVersion.name.split('.')[0]
        };

        const updateMessageComponent = updateMessage ? (
            <>
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>{updateMessage}</span>
            </>
        ) : null;

        setCurrentTestAtVersionId(atVersion.id);
        setCurrentTestBrowserVersionId(browserVersion.id);
        setCurrentAtVersion(atVersion);
        setCurrentBrowserVersion(browserVersion);
        setUpdateMessageComponent(updateMessageComponent);

        const { testPlanRun: _testPlanRun, testPlanReport: _testPlanReport } =
            await createTestResultForRenderer(
                currentTest.id,
                atVersion.id,
                browserVersion.id
            );
        updateLocalState(_testPlanRun, _testPlanReport);
        handleAtAndBrowserDetailsModalCloseAction();
    };

    const handleAtAndBrowserDetailsModalCloseAction = () => {
        setIsShowingAtBrowserModal(false);
        if (isEditAtBrowserDetailsModalClick)
            editAtBrowserDetailsButtonRef.current.focus();
    };

    const onThemedModalClose = () => {
        setShowThemedModal(false);
        editAtBrowserDetailsButtonRef.current.focus();
    };

    const renderTestsCompletedInfoBox = () => {
        let isReviewingBot = false;
        if (openAsUserId) {
            isReviewingBot = isBot(openAsUser);
        }

        let content;

        if (isReviewingBot) {
            content = (
                <>
                    <b>{`${testResults.reduce(
                        (acc, { scenarioResults }) =>
                            acc +
                            (scenarioResults &&
                            scenarioResults.every(({ output }) => !!output)
                                ? 1
                                : 0),
                        0
                    )} of ${tests.length}`}</b>{' '}
                    responses collected.
                </>
            );
        } else if (!isSignedIn) {
            content = <b>{tests.length} tests to view</b>;
        } else if (hasTestsToRun) {
            content = (
                <>
                    {' '}
                    <b>{`${testResults.reduce(
                        (acc, { completedAt }) => acc + (completedAt ? 1 : 0),
                        0
                    )} of ${tests.length}`}</b>{' '}
                    tests completed
                </>
            );
        } else {
            content = <div>No tests for this AT and Browser combination</div>;
        }
        return (
            <div className="test-info-entity tests-completed">
                <div className="info-label">
                    <FontAwesomeIcon
                        icon={hasTestsToRun ? faCheck : faExclamationCircle}
                    />
                    {content}
                </div>
            </div>
        );
    };

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
                    onClick={handleEditResultsClick}
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

        const externalLogsUrl =
            collectionJobQuery?.collectionJobByTestPlanRunId?.externalLogsUrl;

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
                                <FontAwesomeIcon
                                    icon={faExclamationCircle}
                                    color="#94979b"
                                />
                            }
                            target="_blank"
                            href={issueLink}
                        />
                    </li>
                    {isBot(openAsUser) && externalLogsUrl ? (
                        <li>
                            <OptionButton
                                text="View Log"
                                target="_blank"
                                href={externalLogsUrl}
                            />
                        </li>
                    ) : (
                        <li>
                            <OptionButton
                                text="Start Over"
                                icon={
                                    <FontAwesomeIcon
                                        icon={faRedo}
                                        color="#94979b"
                                    />
                                }
                                onClick={handleStartOverButtonClick}
                                disabled={!isSignedIn}
                            />
                        </li>
                    )}

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
                    <span className="task-label">Test {currentTest.seq}:</span>
                    {currentTest.title}
                </h1>
                <span>{heading}</span>
                <StatusBar
                    key={nextId()}
                    hasConflicts={currentTest.hasConflicts}
                    handleReviewConflictsButtonClick={
                        handleReviewConflictsButtonClick
                    }
                />
                {pageReady && (isSignedIn ? currentTest.testResult : true) && (
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
                                    testPageUrl={testPlanVersion.testPageUrl}
                                    testFormatVersion={
                                        testPlanVersion.metadata
                                            .testFormatVersion
                                    }
                                    testRunStateRef={testRunStateRef}
                                    recentTestRunStateRef={
                                        recentTestRunStateRef
                                    }
                                    testRunResultRef={testRunResultRef}
                                    submitButtonRef={
                                        testRendererSubmitButtonRef
                                    }
                                    isReviewingBot={isBot(openAsUser)}
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
                        actions={[
                            {
                                onClick: handleStartOverAction
                            }
                        ]}
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
                        issueLink={issueLink}
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
        if (isBot(openAsUser)) {
            openAsUserHeading = (
                <div className="test-info-entity reviewing-as bot">
                    Reviewing tests of{' '}
                    <FontAwesomeIcon icon={faRobot} className="m-0" />{' '}
                    <b>{`${openAsUser.username}`}.</b>
                </div>
            );
        } else {
            openAsUserHeading = (
                <div className="test-info-entity reviewing-as">
                    Reviewing tests of <b>{`${openAsUser.username}`}.</b>
                    <p>{`All changes will be saved as performed by ${openAsUser.username}.`}</p>
                </div>
            );
        }
    }

    heading = pageReady && (
        <>
            <div className="test-info-wrapper">
                <div
                    className="test-info-entity apg-example-name"
                    data-test="apg-example-name"
                >
                    <div className="info-label">
                        <b>Test Plan:</b>{' '}
                        {`${
                            testPlanVersion.title ||
                            testPlanVersion.testPlan?.directory ||
                            ''
                        }`}
                    </div>
                </div>
                <div
                    className="test-info-entity at-browser"
                    data-test="at-browser"
                >
                    <div className="at-browser-row">
                        <div className="info-label">
                            <b>AT:</b>{' '}
                            {`${testPlanReport.at?.name}${
                                isSignedIn ? ` ${currentAtVersion?.name}` : ''
                            }`}
                        </div>
                        <div className="info-label">
                            <b>Browser:</b>{' '}
                            {`${testPlanReport.browser?.name}${
                                isSignedIn
                                    ? ` ${currentBrowserVersion?.name || ''}`
                                    : ''
                            }`}
                        </div>
                    </div>
                    {isSignedIn && (
                        <Button
                            ref={editAtBrowserDetailsButtonRef}
                            id="edit-fa-button"
                            aria-label="Edit version details for AT and Browser"
                            onClick={handleEditAtBrowserDetailsClick}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                    )}
                </div>
                {renderTestsCompletedInfoBox()}
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

    return (
        pageReady && (
            <Container className="test-run-container">
                <Helmet>
                    <title>
                        {hasTestsToRun
                            ? `${currentTest.title} for ${testPlanReport.at?.name} ${currentAtVersion?.name} and ${testPlanReport.browser?.name} ${currentBrowserVersion?.name} ` +
                              `| ARIA-AT`
                            : 'No tests for this AT and Browser | ARIA-AT'}
                    </title>
                </Helmet>
                {updateMessageComponent && (
                    <Alert
                        variant="success"
                        className="at-browser-details-modal-alert"
                    >
                        {updateMessageComponent}
                    </Alert>
                )}
                <Row>
                    <TestNavigator
                        show={showTestNavigator}
                        tests={tests}
                        currentTestIndex={currentTestIndex}
                        toggleShowClick={toggleTestNavigator}
                        handleTestClick={handleTestClick}
                        testPlanRun={testPlanRun}
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
                {showThemedModal && (
                    <BasicThemedModal
                        show={showThemedModal}
                        theme={'warning'}
                        title={themedModalTitle}
                        dialogClassName="modal-50w"
                        content={themedModalContent}
                        actionButtons={
                            themedModalOtherButton
                                ? [
                                      themedModalOtherButton,
                                      {
                                          text: 'Continue without changes',
                                          action: onThemedModalClose
                                      }
                                  ]
                                : [
                                      // only applies to Admin, Scenario 4
                                      {
                                          text: 'Continue',
                                          action: onThemedModalClose
                                      }
                                  ]
                        }
                        handleClose={onThemedModalClose}
                    />
                )}
                {isSignedIn && isShowingAtBrowserModal && (
                    <AtAndBrowserDetailsModal
                        show={isShowingAtBrowserModal}
                        firstLoad={!currentTest.testResult}
                        isAdmin={isAdminReviewer}
                        atName={testPlanReport.at.name}
                        atVersion={currentTest.testResult?.atVersion?.name}
                        atVersions={testPlanReport.at.atVersions.map(
                            item => item.name
                        )}
                        browserName={testPlanReport.browser.name}
                        browserVersion={
                            currentTest.testResult?.browserVersion?.name
                        }
                        browserVersions={testPlanReport.browser.browserVersions.map(
                            item => item.name
                        )}
                        patternName={testPlanVersion.title}
                        testerName={tester.username}
                        handleAction={handleAtAndBrowserDetailsModalAction}
                        handleClose={handleAtAndBrowserDetailsModalCloseAction}
                    />
                )}
            </Container>
        )
    );
};

export default TestRun;
