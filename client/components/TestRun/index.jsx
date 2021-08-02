import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
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
import RaiseIssueModal from '@components/RaiseIssueModal';
import ReviewConflictsModal from '@components/ReviewConflictsModal';
import StatusBar from '@components/StatusBar';
import TestResult from '@components/TestResult';
import TestIframe from '@components/TestIframe';
import Loading from '../Loading';
import { TEST_RUN_PAGE_QUERY } from './queries';
import './TestRun.css';

const TestRun = ({ auth, openAsUserId }) => {
    const params = useParams();
    const { testPlanId: testPlanReportId, runId: testPlanRunId } = params;

    const { loading, data, refetch } = useQuery(TEST_RUN_PAGE_QUERY, {
        variables: { testPlanReportId, testPlanRunId }
    });

    const { id: userId } = auth;

    const [showTestNavigator, setShowTestNavigator] = useState(true);
    const [currentTestIndex, setCurrentTestIndex] = useState(1);

    if (!data || loading) {
        return (
            <Loading
                title="Loading - Test Results | ARIA-AT"
                heading="Testing Task"
            />
        );
    }

    const { testPlanReport, testPlanRun, users } = data;
    const { testPlanTarget, testPlanVersion, conflictCount } = testPlanReport;

    const hasTestsToRun = testPlanRun.testResults.length;

    const toggleTestNavigator = () => setShowTestNavigator(!showTestNavigator);

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

    const handleRaiseIssueClick = async () => {};

    const handleRedoClick = async () => {};

    const renderTestContent = (testPlanReport, testResult, heading) => {
        const { conflictCount } = testPlanReport;

        const { isComplete, isSkipped, index } = testResult;
        const isFirstTest = index === 1;
        const isLastTest = currentTestIndex === testPlanRun.testResults.length;

        let primaryButtons = []; // These are the list of buttons that will appear below the tests
        let forwardButtons = []; // These are buttons that navigate to next tests and continue

        const nextButton = (
            <Button
                variant="secondary"
                onClick={handleNextTestClick}
                key="nextButton"
            >
                Next Test
            </Button>
        );

        const prevButton = (
            <Button
                variant="secondary"
                onClick={handlePreviousTestClick}
                key="previousButton"
                className="testrun__button-right"
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
                    disabled={isLastTest && !isComplete}
                    onClick={handleNextTestClick}
                >
                    Continue
                </Button>
            );

            if (!isLastTest) forwardButtons = [nextButton];
            primaryButtons = [
                prevButton,
                editButton,
                ...forwardButtons,
                continueButton
            ];
        } else {
            const saveResultsButton = (
                <Button variant="primary" onClick={handleSaveClick}>
                    Submit Results
                </Button>
            );
            if (!isLastTest) forwardButtons = [nextButton];
            primaryButtons = [prevButton, ...forwardButtons, saveResultsButton];
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
                    <Button
                        className="btn-block"
                        variant="secondary"
                        onClick={handleRaiseIssueClick}
                    >
                        <FontAwesomeIcon icon={faExclamationCircle} />
                        Raise an issue
                    </Button>

                    <Button
                        className="btn-block"
                        variant="secondary"
                        onClick={handleRedoClick}
                    >
                        <FontAwesomeIcon icon={faRedo} />
                        Start over
                    </Button>

                    <Button
                        className="btn-block"
                        variant="secondary"
                        onClick={handleCloseRunClick}
                    >
                        Save and Close
                    </Button>
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
                <Row>
                    <Col md={9} className="test-iframe-container">
                        {/*<Row>{testContent}</Row>*/}
                        <Row>{primaryButtonGroup}</Row>
                    </Col>
                    <Col className="current-test-options" md={3}>
                        {menuRightOfContent}
                    </Col>
                </Row>
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
                            <b>{`${currentTestIndex} of ${testPlanRun.testResults.length}`}</b>{' '}
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
                    {`${testPlanTarget.at.name} ${testPlanTarget.atVersion} with ${testPlanTarget.browser.name} ${testPlanTarget.browserVersion}`}
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

                                    if (t) {
                                        if (t.serializedForm && !t.result) {
                                            resultClassName = 'in-progress';
                                            resultStatus = 'In Progress:';
                                        } else if (conflictCount) {
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
                                            key={i}
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
