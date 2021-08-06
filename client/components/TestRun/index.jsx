import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Link, useParams, useHistory } from 'react-router-dom';
import useRouterQuery from '../../hooks/useRouterQuery';
import { useQuery, useMutation } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faAlignLeft,
    faArrowRight,
    faRedo,
    faExclamationCircle,
    faCheck,
    faPen
} from '@fortawesome/free-solid-svg-icons';
import nextId from 'react-id-generator';
import { Alert, Button, Col, Container, Modal, Row } from 'react-bootstrap';
import queryString from 'query-string';
import RaiseIssueModal from '../RaiseIssueModal';
import ReviewConflictsModal from './ReviewConflictsModal';
import StatusBar from './StatusBar';
import TestResult from '../TestResult';
import TestIframe from './TestIframe';
import OptionButton from './OptionButton';
import Loading from '../common/Loading';
import BasicModal from '../common/BasicModal';
import { TEST_RUN_PAGE_QUERY, CLEAR_TEST_RESULT_MUTATION } from './queries';
import './TestRun.css';

const TestRun = ({ auth }) => {
    const params = useParams();
    const history = useHistory();
    const routerQuery = useRouterQuery();

    const { runId: testPlanRunId } = params;

    const { loading, data, refetch } = useQuery(TEST_RUN_PAGE_QUERY, {
        variables: { testPlanRunId }
    });
    const [clearTestResult] = useMutation(CLEAR_TEST_RESULT_MUTATION);

    const { id: userId } = auth;
    const openAsUserId = routerQuery.get('user');

    const [showTestNavigator, setShowTestNavigator] = useState(true);
    const [currentTestIndex, setCurrentTestIndex] = useState(1);
    const [showStartOverModal, setShowStartOverModal] = useState(false);
    const [showRaiseIssueModal, setShowRaiseIssueModal] = useState(false);
    const [showReviewConflictsModal, setShowReviewConflictsModal] = useState(
        false
    );

    if (!data || loading) {
        return (
            <Loading
                title="Loading - Test Results | ARIA-AT"
                heading="Testing Task"
            />
        );
    }

    const { testPlanRun, users } = data;
    const { testPlanReport } = testPlanRun;
    const { testPlanTarget, testPlanVersion, conflicts } = testPlanReport;

    const hasTestsToRun = testPlanRun.testResults.length;

    const toggleTestNavigator = () => setShowTestNavigator(!showTestNavigator);

    const navigateTests = (previous = false) => {
        // assume navigation forward if previous is false
        let newTestIndex = currentTestIndex;
        if (!previous) {
            // next
            const newTestIndexToEval = currentTestIndex + 1;
            if (newTestIndexToEval <= testPlanRun.testResults.length)
                newTestIndex = newTestIndexToEval;
        } else {
            // previous
            const newTestIndexToEval = currentTestIndex - 1;
            if (
                newTestIndexToEval >= 1 &&
                newTestIndexToEval <= testPlanRun.testResults.length
            )
                newTestIndex = newTestIndexToEval;
        }
        setCurrentTestIndex(newTestIndex);
    };

    const performButtonAction = async (action, index) => {
        const testerId = openAsUserId || userId;
        const currentTest = testPlanRun.testResults.find(
            t => t.index === currentTestIndex
        );

        switch (action) {
            case 'goToTestAtIndex': {
                // TODO: Save serialized form
                setCurrentTestIndex(index);
                break;
            }
            case 'goToNextTest': {
                // TODO: Save serialized form
                navigateTests();
                break;
            }
            case 'goToPreviousTest': {
                // TODO: Save serialized form
                navigateTests(true);
                break;
            }
            case 'editTest': {
                break;
            }
            case 'saveTest': {
                break;
            }
            case 'closeTest': {
                // TODO: Save serialized form
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

    const handleRaiseIssueButtonClick = async () =>
        setShowRaiseIssueModal(true);

    const handleStartOverButtonClick = async () => setShowStartOverModal(true);

    const handleStartOverAction = async () => {
        await clearTestResult({
            variables: {
                testPlanRunId,
                index: currentTestIndex
            }
        });
        await refetch();

        // close modal after action
        setShowStartOverModal(false);
    };

    const handleReviewConflictsButtonClick = async () =>
        setShowReviewConflictsModal(true);

    const renderTestContent = (testPlanReport, testResult, heading) => {
        const { isComplete, index, result, serializedForm } = testResult;
        const isFirstTest = index === 1;
        const isLastTest = currentTestIndex === testPlanRun.testResults.length;

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
                    disabled={isLastTest && !isComplete}
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
            const saveResultsButton = (
                <Button
                    key="saveResultsButton"
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
                        disabled={!result || !serializedForm}
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
                <h1 data-test="testing-task">
                    <span className="task-label">Testing task:</span>{' '}
                    {`${currentTestIndex}.`} {testResult.title}
                </h1>
                <span>{heading}</span>
                <StatusBar
                    key={nextId()}
                    conflicts={conflicts[currentTestIndex]}
                    handleReviewConflictsButtonClick={
                        handleReviewConflictsButtonClick
                    }
                />
                <Row>
                    <Col md={9} className="test-iframe-container">
                        {/*<Row>{testContent}</Row>*/}
                        <Row>{primaryButtonGroup}</Row>
                    </Col>
                    <Col className="current-test-options" md={3}>
                        {menuRightOfContent}
                    </Col>
                </Row>
                <BasicModal
                    show={showStartOverModal}
                    centered={true}
                    animation={false}
                    details={{
                        title: 'Start Over',
                        description: `Are you sure you want to start over Test #${currentTestIndex}? Your progress (if any), will be lost.`
                    }}
                    handleAction={handleStartOverAction}
                    handleClose={() => setShowStartOverModal(false)}
                />
                <ReviewConflictsModal
                    show={showReviewConflictsModal}
                    testerId={openAsUserId || userId}
                    conflicts={conflicts[currentTestIndex]}
                    handleClose={() => setShowReviewConflictsModal(false)}
                />
            </>
        );
    };

    let heading;
    let content = null;
    let testContent = null;
    let openAsUserHeading = null;

    if (openAsUserId) {
        const openAsUser = users.filter(user => user.id === openAsUserId);
        openAsUserHeading = (
            <>
                <div className="test-info-entity reviewing-as">
                    Reviewing tests of <b>{`${openAsUser.username}`}.</b>
                    <p>{`All changes will be saved as performed by ${openAsUser.username}.`}</p>
                </div>
            </>
        );
    }

    if (hasTestsToRun) {
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
                            <FontAwesomeIcon icon={faCheck} />
                            <b>{`${testPlanRun.testResultCount} of ${testPlanRun.testResults.length}`}</b>{' '}
                            tests completed
                        </div>
                    </div>
                </div>
                {openAsUserHeading}
            </>
        );
    } else {
        heading = (
            <>
                <div className="test-info-entity apg-example-name">
                    <div className="info-label">APG Example</div>
                    {`${testPlanVersion.title || testPlanVersion.directory}`}
                </div>
                <div className="test-info-entity at-browser">
                    <div className="info-label">AT and Browser</div>
                    {`${testPlanTarget.title}`}
                </div>
            </>
        );
        content = <div>No tests for this Browser / AT Combination</div>;
    }

    if (!testPlanRun.isComplete) {
        testContent = renderTestContent(
            testPlanReport,
            testPlanRun.testResults.find(t => t.index === currentTestIndex),
            heading
        );
    } else {
        content = (
            <div>
                {heading}
                <p>
                    Tests are complete. Please return to the{' '}
                    <Link to="/test-queue">Test Queue</Link>.
                </p>
            </div>
        );
    }

    return (
        <Container className="test-run-container">
            <Helmet>
                <title>{testPlanTarget.title}</title>
            </Helmet>
            <Row>
                <Col className="test-navigator" md={showTestNavigator ? 3 : 12}>
                    {showTestNavigator && <h2>Test Navigator</h2>}
                    <div className="test-navigator-toggle-container">
                        <button
                            onClick={toggleTestNavigator}
                            className={`test-navigator-toggle ${
                                showTestNavigator ? 'hide' : 'show'
                            }`}
                        >
                            {showTestNavigator ? (
                                <FontAwesomeIcon icon={faArrowLeft} />
                            ) : (
                                <FontAwesomeIcon icon={faArrowRight} />
                            )}
                            <FontAwesomeIcon icon={faAlignLeft} />
                        </button>
                    </div>
                    {showTestNavigator && (
                        <nav role="complementary">
                            <ol className="test-navigator-list">
                                {testPlanRun.testResults.map((t, i) => {
                                    let resultClassName = 'not-started';
                                    let resultStatus = 'Not Started:';

                                    const testConflicts =
                                        conflicts[t.index] || [];

                                    if (t) {
                                        if (t.serializedForm && !t.result) {
                                            resultClassName = 'in-progress';
                                            resultStatus = 'In Progress:';
                                        } else if (testConflicts.length) {
                                            resultClassName = 'conflicts';
                                            resultStatus = 'Has Conflicts:';
                                        } else if (
                                            t.serializedForm &&
                                            t.result
                                        ) {
                                            resultClassName = 'complete';
                                            resultStatus = 'Complete Test:';
                                        }
                                    }

                                    return (
                                        <li
                                            className={`test-name-wrapper ${resultClassName}`}
                                            key={`TestNavigatorItem_${i}`}
                                        >
                                            <a
                                                href="#"
                                                onClick={async () =>
                                                    await handleTestClick(i + 1)
                                                }
                                                className="test-name"
                                                aria-label={`${resultStatus} ${t.title}`}
                                                aria-current={
                                                    t.index === currentTestIndex
                                                }
                                            >
                                                {t.title}
                                            </a>
                                            <span
                                                className="progress-indicator"
                                                title={`${resultStatus}`}
                                            />
                                        </li>
                                    );
                                })}
                            </ol>
                        </nav>
                    )}
                </Col>
                <Col className="main-test-area" as="main">
                    {testContent || (
                        <Row>
                            <Col>{content}</Col>
                        </Row>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

TestRun.propTypes = {
    auth: PropTypes.object,
    openAsUserId: PropTypes.number
};

const mapStateToProps = state => {
    const { auth } = state;
    return { auth };
};

export default connect(mapStateToProps)(TestRun);
