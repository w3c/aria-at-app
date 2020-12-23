import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
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
import {
    getActiveRunConfiguration,
    getActiveRuns,
    saveResult
} from '../../actions/runs';
import RaiseIssueModal from '@components/RaiseIssueModal';
import ReviewConflictsModal from '@components/ReviewConflictsModal';
import StatusBar from '@components/StatusBar';
import TestResult from '@components/TestResult';
import TestIframe from '@components/TestIframe';
import checkForConflict from '../../utils/checkForConflict';
import './TestRun.css';

const PROGRESS_SAVED = 'Progress has been saved.';

class TestRun extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTestIndex: 1,
            runComplete: false,
            resultsStatus: '',
            showTestNavigator: true,
            showRaiseIssueModal: false,
            showConfirmModal: false,
            showConflictsModal: false,
            saveButtonClicked: false
        };
        this.buttonAction = null;

        // Handle which test to display
        this.displayNextTest = this.displayNextTest.bind(this);
        this.displayPreviousTest = this.displayPreviousTest.bind(this);
        this.displayTestByIndex = this.displayTestByIndex.bind(this);
        this.saveTestResultOrProgress = this.saveTestResultOrProgress.bind(
            this
        );
        this.deleteResultFromTest = this.deleteResultFromTest.bind(this);
        this.toggleTestNavigator = this.toggleTestNavigator.bind(this);

        // Handle actions
        this.handleSaveClick = this.handleSaveClick.bind(this);
        this.handleNextTestClick = this.handleNextTestClick.bind(this);
        this.handlePreviousTestClick = this.handlePreviousTestClick.bind(this);
        this.handleCloseRunClick = this.handleCloseRunClick.bind(this);
        this.handleRedoClick = this.handleRedoClick.bind(this);
        this.handleEditClick = this.handleEditClick.bind(this);
        this.handleRaiseIssueClick = this.handleRaiseIssueClick.bind(this);
        this.handleConflictsModalClick = this.handleConflictsModalClick.bind(
            this
        );
        this.handleRaiseIssueFromConflictClick = this.handleRaiseIssueFromConflictClick.bind(
            this
        );
        this.handleTestClick = this.handleTestClick.bind(this);

        // Modal actions
        this.handleModalCloseClick = this.handleModalCloseClick.bind(this);
        this.handleModalConfirmClick = this.handleModalConfirmClick.bind(this);

        this.iframe = React.createRef();
    }

    async componentDidMount() {
        const { dispatch, run, activeRunConfiguration } = this.props;
        if (!activeRunConfiguration) {
            dispatch(getActiveRunConfiguration());
        }
        if (!run) {
            dispatch(getActiveRuns());
        }
    }

    displayNextTest() {
        const { run } = this.props;
        let newIndex = this.state.currentTestIndex + 1;
        if (newIndex > run.tests.length) {
            this.setState({
                runComplete: true,
                resultsStatus: '',
                saveButtonClicked: false
            });
        } else {
            this.setState({
                currentTestIndex: newIndex,
                resultsStatus: '',
                saveButtonClicked: false
            });
        }
    }

    displayTestByIndex(index) {
        this.setState({
            currentTestIndex: index,
            resultsStatus: '',
            saveButtonClicked: false
        });
    }

    displayPreviousTest() {
        this.setState({
            currentTestIndex: this.state.currentTestIndex - 1,
            resultsStatus: '',
            saveButtonClicked: false
        });
    }

    toggleTestNavigator() {
        this.setState({
            showTestNavigator: !this.state.showTestNavigator
        });
    }

    async saveTestResultOrProgress({ results, serializedForm }) {
        const { dispatch, run, userId, openAsUser } = this.props;
        const test = run.tests[this.state.currentTestIndex - 1];
        await dispatch(
            saveResult({
                test_id: test.id,
                run_id: run.id,
                user_id: openAsUser || userId,
                result: results,
                serialized_form: serializedForm
            })
        );
        return true;
    }

    async deleteResultFromTest(serializedForm) {
        const { dispatch, run, userId, openAsUser } = this.props;
        const test = run.tests[this.state.currentTestIndex - 1];
        await dispatch(
            saveResult({
                test_id: test.id,
                run_id: run.id,
                user_id: openAsUser || userId,
                serialized_form: serializedForm
            })
        );
        return true;
    }

    handleModalCloseClick() {
        this.setState({
            showConfirmModal: false
        });
    }

    handleModalConfirmClick() {
        const action = this.buttonAction;
        this.buttonAction = null;
        this.setState({
            showConfirmModal: false
        });
        this.performButtonAction(action);
    }

    async performButtonAction(action, index) {
        const { openAsUser, userId, history, run } = this.props;

        const testerId = openAsUser || userId;
        const test = run.tests[this.state.currentTestIndex - 1];

        switch (action) {
            case 'saveTest': {
                this.iframe.current.triggerSubmit();
                this.setState({
                    saveButtonClicked: true
                });
                break;
            }
            case 'closeTest': {
                // Save the serialized form of iframe
                if (this.iframe.current) {
                    const saved = await this.iframe.current.saveTestProgress();
                    if (saved) {
                        this.setState({ resultsStatus: PROGRESS_SAVED }, () => {
                            setTimeout(() => {
                                history.push(`/test-queue`);
                            }, 200);
                        });
                    } else {
                        history.push(`/test-queue`);
                    }
                } else {
                    history.push(`/test-queue`);
                }
                break;
            }
            case 'goToNextTest': {
                // Save the serialized form of iframe
                if (this.iframe.current) {
                    const saved = await this.iframe.current.saveTestProgress();
                    if (saved) {
                        this.setState({ resultsStatus: PROGRESS_SAVED }, () => {
                            setTimeout(() => {
                                this.displayNextTest();
                            }, 200);
                        });
                    } else {
                        this.displayNextTest();
                    }
                } else {
                    this.displayNextTest();
                }

                break;
            }
            case 'goToPreviousTest': {
                // Save the serialized form of iframe
                if (this.iframe.current) {
                    const saved = await this.iframe.current.saveTestProgress();
                    if (saved) {
                        this.setState({ resultsStatus: PROGRESS_SAVED }, () => {
                            setTimeout(() => {
                                this.displayPreviousTest();
                            }, 200);
                        });
                    } else {
                        this.displayPreviousTest();
                    }
                } else {
                    this.displayPreviousTest();
                }
                break;
            }
            case 'goToTestAtIndex': {
                // Save the serialized form of iframe
                if (this.iframe.current) {
                    const saved = await this.iframe.current.saveTestProgress();
                    if (saved) {
                        this.setState({ resultsStatus: PROGRESS_SAVED }, () => {
                            setTimeout(() => {
                                this.displayTestByIndex(index);
                            }, 200);
                        });
                    } else {
                        this.displayTestByIndex(index);
                    }
                } else {
                    this.displayTestByIndex(index);
                }
                break;
            }
            case 'redoTest': {
                if (this.iframe.current) {
                    this.iframe.current.reloadAndClear();
                }
                await this.deleteResultFromTest();
                break;
            }
            case 'editTest': {
                // save serialized form state, since it will be
                // gone from state after results are deleted
                const serializedForm = test.results[testerId].serialized_form;
                await this.deleteResultFromTest(serializedForm);
                break;
            }
        }
    }

    confirm(action) {
        this.buttonAction = action;
        this.setState({
            showConfirmModal: true
        });
    }

    handleSaveClick() {
        this.performButtonAction('saveTest');
    }

    handleNextTestClick() {
        this.performButtonAction('goToNextTest');
    }

    handlePreviousTestClick() {
        this.performButtonAction('goToPreviousTest');
    }

    handleRedoClick() {
        this.confirm('redoTest');
    }

    handleCloseRunClick() {
        this.performButtonAction('closeTest');
    }

    handleEditClick() {
        this.performButtonAction('editTest');
    }

    handleRaiseIssueClick() {
        this.setState({
            showRaiseIssueModal: !this.state.showRaiseIssueModal,
            showConflictsModal: false
        });
    }

    handleConflictsModalClick() {
        this.setState({
            showConflictsModal: !this.state.showConflictsModal
        });
    }

    handleRaiseIssueFromConflictClick() {
        this.setState({
            showConflictsModal: false,
            showRaiseIssueModal: true
        });
    }

    handleTestClick(index) {
        this.performButtonAction('goToTestAtIndex', index);
    }

    renderModal({ at_key, git_hash, run, test, testIndex, userId, testerId }) {
        let modalTitle, action;

        if (this.buttonAction === 'redoTest') {
            modalTitle = 'Start Over';
            action = `Are you sure you want to start over test ${testIndex}. Your progress (if any) will be lost.`;
        }

        return (
            <>
                <Modal
                    show={this.state.showConfirmModal}
                    onHide={this.handleModalCloseClick}
                    centered
                    animation={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{modalTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{action}</Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={this.handleModalCloseClick}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={this.handleModalConfirmClick}
                        >
                            Continue
                        </Button>
                    </Modal.Footer>
                </Modal>

                <ReviewConflictsModal
                    onHide={this.handleConflictsModalClick}
                    show={this.state.showConflictsModal}
                    userId={userId}
                    testerId={testerId}
                    test={test}
                    handleRaiseIssueClick={this.handleRaiseIssueClick}
                />

                <RaiseIssueModal
                    at_key={at_key}
                    git_hash={git_hash}
                    onHide={this.handleRaiseIssueClick}
                    run={run}
                    show={this.state.showRaiseIssueModal}
                    test={test}
                    testIndex={testIndex}
                    userId={userId}
                    testerId={testerId}
                />
            </>
        );
    }

    renderTest({ run, test, git_hash, at_key, testIndex, testerId }, heading) {
        const { conflicts } = this.state;
        const { userId } = this.props;
        this.testHasResult = test.results && test.results[testerId];

        const isFirstTest = run.tests.findIndex(t => t.id === test.id) === 0;

        this.testResultsCompleted =
            this.testHasResult && test.results[testerId].status === 'complete';

        this.testResultsSkipped =
            this.testHasResult &&
            test.results[testerId].status === 'incomplete';

        const statusProps = {
            conflicts,
            git_hash,
            handleCloseRunClick: this.handleCloseRunClick,
            handleNextTestClick: this.handleNextTestClick,
            handlePreviousTestClick: this.handlePreviousTestClick,
            handleRaiseIssueClick: this.handleRaiseIssueClick,
            handleRedoClick: this.handleRedoClick,
            handleConflictsModalClick: this.handleConflictsModalClick,
            run,
            test,
            testIndex,
            testerId
        };

        let testContent = null;

        let primaryButtonGroup;
        const nextButton = (
            <Button
                variant="secondary"
                onClick={this.handleNextTestClick}
                key="nextButton"
            >
                Next Test
            </Button>
        );
        const prevButton = (
            <Button
                variant="secondary"
                onClick={this.handlePreviousTestClick}
                key="previousButton"
                className="testrun__button-right"
                disabled={isFirstTest}
            >
                Previous Test
            </Button>
        );
        let primaryButtons = [prevButton, nextButton];

        if (this.testResultsCompleted) {
            const editButton = (
                <Button
                    className="edit-results"
                    variant="secondary"
                    onClick={this.handleEditClick}
                >
                    <FontAwesomeIcon icon={faPen} />
                    Edit Results
                </Button>
            );
            const continueButton = (
                <Button variant="primary" onClick={this.handleNextTestClick}>
                    Continue
                </Button>
            );
            primaryButtons = [...primaryButtons, editButton, continueButton];
        } else {
            const saveResultsButton = (
                <Button variant="primary" onClick={this.handleSaveClick}>
                    Submit Results
                </Button>
            );
            primaryButtons = [...primaryButtons, saveResultsButton];
        }

        primaryButtonGroup = (
            <div className="testrun__button-toolbar-group">
                {primaryButtons}
            </div>
        );

        let menuRightOfContent = (
            <div role="complementary">
                <h3>Test Options</h3>
                <div className="options-wrapper">
                    <Button
                        className="btn-block"
                        variant="secondary"
                        onClick={this.handleRaiseIssueClick}
                    >
                        <FontAwesomeIcon icon={faExclamationCircle} />
                        Raise an issue
                    </Button>

                    <Button
                        className="btn-block"
                        variant="secondary"
                        onClick={this.handleRedoClick}
                    >
                        <FontAwesomeIcon icon={faRedo} />
                        Start over
                    </Button>

                    <Button
                        className="btn-block"
                        variant="secondary"
                        onClick={this.handleCloseRunClick}
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

        if (this.testResultsCompleted) {
            testContent = <TestResult testResult={test.results[testerId]} />;
        } else if (this.testResultsSkipped) {
            testContent = (
                <TestIframe
                    git_hash={git_hash}
                    file={test.file}
                    at_key={at_key}
                    saveTestResultOrProgress={this.saveTestResultOrProgress}
                    ref={this.iframe}
                    serializedForm={test.results[testerId].serialized_form}
                ></TestIframe>
            );
        } else {
            testContent = (
                <TestIframe
                    git_hash={git_hash}
                    file={test.file}
                    at_key={at_key}
                    saveTestResultOrProgress={this.saveTestResultOrProgress}
                    ref={this.iframe}
                ></TestIframe>
            );
        }

        let modals = this.renderModal({
            at_key,
            git_hash,
            run,
            test,
            testIndex,
            userId,
            testerId
        });

        const result =
            test.results &&
            Object.values(test.results).find(
                ({ test_id, user_id }) =>
                    test_id === test.id && user_id === testerId
            );

        return (
            <Fragment>
                <h1 data-test="testing-task">
                    <span className="task-label">Testing task:</span>{' '}
                    {`${this.state.currentTestIndex}.`} {test.name}
                </h1>
                <span>{heading}</span>
                <StatusBar key={nextId()} {...statusProps} />
                <Row>
                    <Col md={9} className="test-iframe-contaner">
                        <Row>{testContent}</Row>
                        <Row>{primaryButtonGroup}</Row>
                        <Row>
                            {result &&
                            result.status === 'complete' &&
                            this.state.saveButtonClicked ? (
                                <Alert key={nextId()} variant="success">
                                    <FontAwesomeIcon icon={faCheck} /> Thanks!
                                    Your results have been submitted
                                </Alert>
                            ) : (
                                <div>
                                    {this.state.resultsStatus ? (
                                        <span className="dot"></span>
                                    ) : (
                                        <></>
                                    )}
                                    {` ${this.state.resultsStatus}`}
                                </div>
                            )}
                        </Row>
                    </Col>
                    <Col className="current-test-options" md={3}>
                        {menuRightOfContent}
                    </Col>
                </Row>
                {modals}
            </Fragment>
        );
    }

    render() {
        const {
            run,
            activeRunConfiguration,
            userId,
            usersById,
            openAsUser
        } = this.props;

        if (!run || !activeRunConfiguration) {
            return <div data-test="test-run-loading">Loading</div>;
        }
        const { git_hash } = activeRunConfiguration.active_test_version;

        const {
            apg_example_name,
            at_key,
            at_name,
            at_version,
            browser_name,
            browser_version
        } = run;

        let test,
            testsToRun = false;
        if (run.tests.length > 0) {
            test = run.tests[this.state.currentTestIndex - 1];
            testsToRun = true;
        }

        let content = null;
        let heading = null;
        let testContent = null;
        let runningAsUserHeader = null;

        if (openAsUser) {
            runningAsUserHeader = (
                <>
                    <div className="test-info-entity reviewing-as">
                        Reviewings tests of{' '}
                        <b>{`${usersById[openAsUser].username}`}.</b>
                        <p>{`All changes will be saved as performed by ${usersById[openAsUser].username}.`}</p>
                    </div>
                </>
            );
        }

        if (testsToRun) {
            heading = (
                <Fragment>
                    <div className="test-info-wrapper">
                        <div
                            className="test-info-entity apg-example-name"
                            data-test="apg-example-name"
                        >
                            <div className="info-label">
                                <b>Test Plan:</b> {`${apg_example_name}`}
                            </div>{' '}
                        </div>
                        <div
                            className="test-info-entity at-browser"
                            data-test="at-browser"
                        >
                            <div className="info-label">
                                <b>AT and Browser:</b>{' '}
                                {`${at_name} ${at_version} with ${browser_name} ${browser_version}`}{' '}
                            </div>
                        </div>
                        <div className="test-info-entity tests-completed">
                            <div className="info-label">
                                <FontAwesomeIcon icon={faCheck} />
                                <b>{`${this.state.currentTestIndex} of ${run.tests.length}`}</b>{' '}
                                Tests completed
                            </div>
                        </div>
                    </div>
                    {runningAsUserHeader}
                </Fragment>
            );

            if (!this.state.runComplete) {
                testContent = this.renderTest(
                    {
                        key: `${test.id}/${this.state.currentTestIndex}`,
                        run,
                        test,
                        testIndex: this.state.currentTestIndex,
                        git_hash,
                        at_key,
                        userId,
                        testerId: openAsUser || userId
                    },
                    heading
                );
            } else {
                content = (
                    <div>
                        {heading}
                        <p>Tests are complete.</p>
                    </div>
                );
            }
        } else {
            heading = (
                <Fragment>
                    <div className="test-info-entity apg-example-name">
                        <div className="info-label">APG Example</div>
                        {`${apg_example_name}`}
                    </div>
                    <div className="test-info-entity at-browser">
                        <div className="info-label">AT and Browser</div>
                        {`${at_name} ${at_version} with ${browser_name} ${browser_version}`}
                    </div>
                </Fragment>
            );
            content = <div>No tests for this browser / AT combination</div>;
        }

        let prepend = '';
        let title = `${apg_example_name} for ${at_name} ${at_version} with ${browser_name} ${browser_version} | ARIA-AT`;

        if (openAsUser) {
            prepend = `Reviewing test results for ${usersById[openAsUser].username} for `;
        } else {
            prepend = 'Testing ';
        }

        title = `${prepend}${title}`;

        return (
            <Container className="test-run-container">
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <Row>
                    {this.state.showTestNavigator ? (
                        <div className="col-md-3 test-navigator">
                            <h2>Test Navigator</h2>
                            <div className="test-navigator-toggle-container">
                                <button
                                    onClick={this.toggleTestNavigator}
                                    className="test-navigator-toggle hide"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    <FontAwesomeIcon icon={faAlignLeft} />
                                </button>
                            </div>
                            <nav role="complementary">
                                <ol className="test-navigator-list">
                                    {run.tests.map((t, i) => {
                                        let resultClassName = 'not-started';
                                        let resultStatus = 'Not Started:';
                                        const testersResult =
                                            t.results &&
                                            t.results[openAsUser || userId];
                                        if (testersResult) {
                                            if (
                                                testersResult.status ==
                                                'incomplete'
                                            ) {
                                                resultClassName = 'in-progress';
                                                resultStatus = 'In Progress:';
                                            } else if (
                                                checkForConflict(t.results)
                                                    .length
                                            ) {
                                                resultClassName = 'conflicts';
                                                resultStatus = 'Has Conflicts:';
                                            } else if (
                                                testersResult.status ===
                                                'complete'
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
                                                    onClick={() => {
                                                        this.handleTestClick(
                                                            i + 1
                                                        );
                                                    }}
                                                    className="test-name"
                                                    aria-label={`${resultStatus} ${t.name}`}
                                                    aria-current={
                                                        t.id === test.id
                                                    }
                                                >
                                                    {t.name}
                                                </a>
                                                <span
                                                    className="progress-indicator"
                                                    title={`${resultStatus}`}
                                                ></span>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </nav>
                        </div>
                    ) : (
                        <></>
                    )}
                    <Col
                        className="main-test-area"
                        as="main"
                        md={this.state.showTestNavigator ? 9 : 12}
                    >
                        {this.state.showTestNavigator ? (
                            <></>
                        ) : (
                            <span className="test-navigator-toggle-container">
                                <button
                                    onClick={this.toggleTestNavigator}
                                    className="test-navigator-toggle show"
                                >
                                    <FontAwesomeIcon icon={faArrowRight} />
                                    <FontAwesomeIcon icon={faAlignLeft} />
                                </button>
                            </span>
                        )}
                        {testContent || (
                            <Row>
                                <Col>{content}</Col>
                            </Row>
                        )}
                    </Col>
                </Row>
            </Container>
        );
    }
}

TestRun.propTypes = {
    activeRunConfiguration: PropTypes.object,
    dispatch: PropTypes.func,
    userId: PropTypes.number,
    openAsUser: PropTypes.number,
    run: PropTypes.object,
    testSuiteVersionData: PropTypes.object,
    usersById: PropTypes.object,
    history: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
    const { activeRunConfiguration, activeRunsById } = state.runs;
    const { usersById } = state.users;
    let userId = state.user.id;
    const isAdmin = state.user.roles && state.user.roles.includes('admin');

    const runId = parseInt(ownProps.match.params.runId);
    let run;
    if (activeRunsById) {
        run = activeRunsById[runId];
    }

    let openAsUser;
    const openAsUserQuery = parseInt(
        queryString.parse(ownProps.location.search).user
    );
    if (isAdmin && openAsUserQuery && usersById[openAsUserQuery]) {
        openAsUser = openAsUserQuery;
    }

    return {
        activeRunConfiguration,
        run,
        usersById,
        openAsUser,
        userId
    };
};

export default connect(mapStateToProps)(TestRun);
