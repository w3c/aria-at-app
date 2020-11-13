import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import nextId from 'react-id-generator';
import {
    Button,
    ButtonToolbar,
    Col,
    Container,
    Modal,
    Pagination,
    Row
} from 'react-bootstrap';
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

class TestRun extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTestIndex: 1,
            runComplete: false,
            showTestNavigator: true,
            showRaiseIssueModal: false,
            showConfirmModal: false,
            showConflictsModal: false
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
                runComplete: true
            });
        } else {
            this.setState({
                currentTestIndex: newIndex
            });
        }
    }

    displayTestByIndex(index) {
        this.setState({
            currentTestIndex: index
        });
    }

    displayPreviousTest() {
        this.setState({
            currentTestIndex: this.state.currentTestIndex - 1
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
                break;
            }
            case 'closeTest': {
                // Save the serialized form of iframe
                if (this.iframe.current) {
                    await this.iframe.current.saveTestProgress();
                }
                history.push(`/test-queue`);
                break;
            }
            case 'goToNextTest': {
                // Save the serialized form of iframe
                if (this.iframe.current) {
                    await this.iframe.current.saveTestProgress();
                }
                this.displayNextTest();
                break;
            }
            case 'goToPreviousTest': {
                // Save the serialized form of iframe
                if (this.iframe.current) {
                    await this.iframe.current.saveTestProgress();
                }
                this.displayPreviousTest();
                break;
            }
            case 'goToTestAtIndex': {
                // Save the serialized form of iframe
                if (this.iframe.current) {
                    await this.iframe.current.saveTestProgress();
                }
                this.displayTestByIndex(index);
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

    renderTest({ run, test, git_hash, at_key, testIndex, testerId }) {
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
        const nextButton = 
                            <Button
                                variant="secondary"
                                onClick={this.handleNextTestClick}
                                key="nextButton"
                            >
                                Next test
                            </Button>
        const prevButton = 
                            <Button
                                variant="secondary"
                                onClick={this.handlePreviousTestClick}
                                key="previousButton"
                                className="testrun__button-right"
                            >
                                Previous test
                            </Button>
        let primaryButtons = isFirstTest ? [nextButton] : [prevButton, nextButton];
        

        if (this.testResultsCompleted) {
            const editButton = 
                            <Button variant="secondary" onClick={this.handleEditClick}>
                                Edit results
                            </Button>
            const continueButton =
                            <Button variant="primary" onClick={this.handleNextTestClick}>
                                Continue
                            </Button>
            primaryButtons = [...primaryButtons, editButton, continueButton];
            
        } else {
            const saveResultsButton =
                    <Button variant="primary" onClick={this.handleSaveClick}>
                        Submit Results
                    </Button>
            primaryButtons = [...primaryButtons, saveResultsButton];
        }

        primaryButtonGroup = (
            <div className="testrun__button-toolbar-group">
                {primaryButtons}
            </div>
        );

        let menuRightOfContent = (
            <nav>
                <Button
                    className="btn-block"
                    variant="primary"
                    onClick={this.handleRaiseIssueClick}
                >
                    Raise an issue
                </Button>
                <Button
                    className="btn-block"
                    variant="primary"
                    onClick={this.handleRedoClick}
                >
                    Start over
                </Button>
                <Button
                    className="btn-block"
                    variant="primary"
                    onClick={this.handleCloseRunClick}
                >
                    Close
                </Button>
            </nav>
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

        return (
            <Fragment>
                <h4 data-test="test-run-h4">Testing task: {test.name}</h4>
                <StatusBar key={nextId()} {...statusProps} />
                <Row>
                    <Col md={9} className="test-iframe-contaner">
                        <Row>{testContent}</Row>
                        <Row>{primaryButtonGroup}</Row>
                    </Col>
                    <Col md={3}>{menuRightOfContent}</Col>
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

        let heading = null;
        let content = null;
        let testContent = null;
        let runningAsUserHeader = null;

        if (openAsUser) {
            runningAsUserHeader = (
                <>
                    <h2>
                        Reviewings tests of{' '}
                        <b>{`${usersById[openAsUser].username}`}</b>
                    </h2>
                    <p>{`All changes will be saved as performed by ${usersById[openAsUser].username}.`}</p>
                </>
            );
        }

        if (testsToRun) {
            heading = (
                <Fragment>
                    {runningAsUserHeader}
                    <h2 data-test="test-run-h2">
                        {' '}
                        {`${apg_example_name} (${this.state.currentTestIndex} of ${run.tests.length})`}
                    </h2>
                    <h3 data-test="test-run-h3">{`${at_name} ${at_version} with ${browser_name} ${browser_version}`}</h3>
                </Fragment>
            );

            if (!this.state.runComplete) {
                testContent = this.renderTest({
                    key: `${test.id}/${this.state.currentTestIndex}`,
                    run,
                    test,
                    testIndex: this.state.currentTestIndex,
                    git_hash,
                    at_key,
                    userId,
                    testerId: openAsUser || userId
                });
            } else {
                content = <div>Tests are complete.</div>;
            }
        } else {
            heading = (
                <Fragment>
                    <h2>{`${apg_example_name}`}</h2>
                    <h3>{`${at_name} ${at_version} with ${browser_name} ${browser_version}`}</h3>
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
            <Fragment>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <Container fluid>
                    <Row>
                        {this.state.showTestNavigator ? (
                            <aside className="col-md-3 test-navigator">
                                <h3>Test Navigator</h3>
                                <button
                                    onClick={this.toggleTestNavigator}
                                    className="test-navigator-toggle hide"
                                >
                                    Hide
                                </button>
                                <ol className="test-navigator-list">
                                    {run.tests.map((t, i) => {
                                        let resultClassName = 'not-started';
                                        let resultStatus = 'not started:';
                                        const testersResult =
                                            t.results &&
                                            t.results[openAsUser || userId];
                                        if (testersResult) {
                                            if (
                                                testersResult.status ==
                                                'incomplete'
                                            ) {
                                                resultClassName = 'in-progress';
                                                resultStatus = 'in progress:';
                                            } else if (
                                                checkForConflict(t.results)
                                                    .length
                                            ) {
                                                resultClassName = 'conflicts';
                                                resultStatus = 'has conflicts:';
                                            } else if (
                                                testersResult.status ===
                                                'complete'
                                            ) {
                                                resultClassName = 'complete';
                                                resultStatus = 'complete test:';
                                            }
                                        }
                                        return (
                                            <li
                                                className={`test-name-wrapper ${resultClassName}`}
                                                key={i}
                                            >
                                                <span className="progress-indicator"></span>
                                                <a
                                                    href="#"
                                                    onClick={() => {
                                                        this.handleTestClick(
                                                            i + 1
                                                        );
                                                    }}
                                                    className="test-name"
                                                    aria-label={`${resultStatus} ${t.name}`}
                                                >
                                                    {t.name}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </aside>
                        ) : (
                            <></>
                        )}
                        <Col md={this.state.showTestNavigator ? 9 : 12}>
                            {this.state.showTestNavigator ? (
                                <></>
                            ) : (
                                <span className="test-navigator-toggle-container">
                                    <button
                                        onClick={this.toggleTestNavigator}
                                        className="test-navigator-toggle show"
                                    ></button>
                                </span>
                            )}
                            {heading}
                            {testContent || (
                                <Row>
                                    <Col>{content}</Col>
                                </Row>
                            )}
                        </Col>
                    </Row>
                </Container>
            </Fragment>
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
