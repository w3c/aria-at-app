import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import './TestRun.css';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import {
    Button,
    ButtonGroup,
    ButtonToolbar,
    Col,
    Container,
    Modal,
    Row
} from 'react-bootstrap';
import {
    getTestCycles,
    getRunsForUserAndCycle,
    getTestSuiteVersions,
    saveResult
} from '../../actions/cycles';
import TestResult from '@components/TestResult';

class TestRun extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTestIndex: 1,
            runComplete: false,
            showConfirmLeaveTestModal: false
        };

        this.testHasResult = false;

        this.handleNextTestClick = this.handleNextTestClick.bind(this);
        this.handlePreviousTestClick = this.handlePreviousTestClick.bind(this);
        this.handleCloseRunClick = this.handleCloseRunClick.bind(this);
        this.handleCloseLeaveTestModal = this.handleCloseLeaveTestModal.bind(
            this
        );
        this.handleConfirmLeaveTest = this.handleConfirmLeaveTest.bind(
            this
        );

        this.testIframe = React.createRef();
    }

    async componentDidMount() {
        const { dispatch, cycleId, tests, testSuiteVersionData } = this.props;
        if (!tests) {
            dispatch(getTestCycles());
            dispatch(getRunsForUserAndCycle(cycleId));
        }
        if (!testSuiteVersionData) {
            dispatch(getTestSuiteVersions());
        }
    }

    handleCloseLeaveTestModal() {
        this.setState({
            showConfirmLeaveTestModal: false
        });
    }

    handleConfirmLeaveTest() {
        const { cycleId, history } = this.props;
        if (this.state.exitAfterConfirm) {
            history.push(`/test-queue/${cycleId}`);
        }
        else {
            this.setState(prevState => {
                return {
                    ...this.nextTestState(prevState),
                    showConfirmLeaveTestModal: false
                };
            });
        }
    }

    handleNextTestClick() {
        // Do not try to save if showing results
        let goToNextTest = this.testHasResults
            ? true
            : this.trySaving();

        if (goToNextTest) {
            this.setState(prevState => {
                return {
                    ...this.nextTestState(prevState)
                };
            });
        }
    }

    handlePreviousTestClick() {
        let goToPreviousTest = this.testHasResults
            ? true
            : this.trySaving();

        if (goToPreviousTest) {
            this.setState({
                currentTestIndex: this.state.currentTestIndex - 1
            });
        }
    }

    handleCloseRunClick() {
        const { cycleId, history } = this.props;
        if (this.testHasResults || this.trySaving({ exitAfterConfirm: true })) {
            history.push(`/test-queue/${cycleId}`);
        }
    }

    trySaving(options) {
        const { dispatch, cycleId, tests, run, userId } = this.props;

        let exitAfterConfirm = options ? options.exitAfterConfirm : false;

        let resultsEl = this.testIframe.current.contentDocument.querySelector(
            '#__ariaatharness__results__'
        );

        if (!resultsEl) {
            this.setState({
                showConfirmLeaveTestModal: true,
                exitAfterConfirm
            });
            return false;
        }

        let result;
        try {
            result = JSON.parse(resultsEl.innerText);
        } catch (error) {
            console.error(
                'Cannot save tests do to malformed information from test file.'
            );
            throw error;
        }

        const test = tests[this.state.currentTestIndex - 1];
        dispatch(
            saveResult({
                test_id: test.id,
                run_id: run.id,
                cycle_id: cycleId,
                user_id: userId,
                result
            })
        );
        return true;
    }

    nextTestState(prevState) {
        const { tests } = this.props;
        let currentTestIndex = prevState.currentTestIndex + 1;
        if (currentTestIndex <= tests.length) {
            return {
                ...prevState,
                currentTestIndex
            };
        } else {
            return {
                ...prevState,
                runComplete: true
            };
        }
    }

    renderModal() {
        return (
            <Fragment>
                <Modal
                    show={this.state.showConfirmLeaveTestModal}
                    onHide={this.handleCloseLeaveTestModal}
                    centered
                    animation={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Leave Test</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{`Are you sure you want to leave this test? Because the test has not been completed in full, your progress on test ${this.state.currentTestIndex} won't be saved.`}</Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={this.handleCloseLeaveTestModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={this.handleConfirmLeaveTest}
                        >
                            Continue
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Fragment>
        );
    }

    render() {
        const { run, tests, testSuiteVersionData } = this.props;

        if (!run || !tests || !testSuiteVersionData) {
            return <div data-test="test-run-loading">Loading</div>;
        }
        const { git_hash } = testSuiteVersionData;

        const {
            apg_example_name,
            at_key,
            at_name,
            at_version,
            browser_name,
            browser_version
        } = run;

        let testName,
            test,
            testsToRun = false;
        if (tests.length > 0) {
            test = tests[this.state.currentTestIndex - 1];
            testName = test.name;
            testsToRun = true;
        }

        this.testHasResults = test.result ? true : false;
        console.log(this.testHasResults);


        let heading = null;
        let content = null;
        let testContent = null;
        let menuUnderContent = null;
        let menuRightOContent = null;

        if (testsToRun) {
            heading = (
                <Fragment>
                    <h2 data-test="test-run-h2">
                        {' '}
                        {`${apg_example_name} (${this.state.currentTestIndex} of ${tests.length})`}
                    </h2>
                    <h3 data-test="test-run-h3">{`${at_name} ${at_version} with ${browser_name} ${browser_version}`}</h3>
                    <h4 data-test="test-run-h4">Testing task: {testName}</h4>
                </Fragment>
            );

            if (!this.state.runComplete) {
                menuUnderContent = (
                    <ButtonToolbar className="testrun__button-toolbar--margin">
                        {this.state.currentTestIndex !== 1 &&
                             <Button variant="primary"
                                     onClick={this.handlePreviousTestClick}
                             >
                               Previous Test
                             </Button>
                        }
                          <Button
                            className="testrun__button--right"
                              variant="primary"
                              onClick={this.handleNextTestClick}
                          >
                              Next Test

                          </Button>
                    </ButtonToolbar>
                );
                menuRightOContent = (
                    <ButtonGroup vertical>
                        <Button variant="primary">Raise an issue</Button>
                        <Button variant="primary">Re-do Test</Button>
                        <Button
                          variant="primary"
                          onClick={this.handleCloseRunClick}
                        >
                          {this.testHasResults ? 'Close' : 'Save and Close'}
                        </Button>
                    </ButtonGroup>
                );

                if (this.testHasResults) {
                    testContent = (
                        <TestResult
                          testResult={test.result}
                        />
                    );
                } else {
                    testContent = (
                        <iframe
                            src={`/aria-at/${git_hash}/${
                                tests[this.state.currentTestIndex - 1].file
                            }?at=${at_key}`}
                            id="test-iframe"
                            ref={this.testIframe}
                        ></iframe>
                    );
                }
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

        let modals = this.renderModal();

        return (
            <Fragment>
                <Helmet>
                    <title>{`Testing ${apg_example_name} for ${at_name} ${at_version} with ${browser_name} ${browser_version} | ARIA-AT`}</title>
                </Helmet>
                <Container fluid>
                    <Row>
                        <Col>{heading}</Col>
                    </Row>

                    <Row>
                        {testContent && menuUnderContent && menuRightOContent ? (
                            <Fragment>
                                <Col md={9}>
                                    <Row>{testContent}</Row>
                                    <Row>{menuUnderContent}</Row>
                                </Col>
                                <Col md={3}>{menuRightOContent}</Col>
                            </Fragment>
                        ) : (
                            <Col>{content}</Col>
                        )}
                    </Row>
                </Container>
                {modals}
            </Fragment>
        );
    }
}

TestRun.propTypes = {
    dispatch: PropTypes.func,
    cycleId: PropTypes.number,
    userId: PropTypes.number,
    tests: PropTypes.array,
    run: PropTypes.object,
    testSuiteVersionData: PropTypes.object,
    history: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
    const { cyclesById, runsForCycle, testSuiteVersions } = state.cycles;
    const { usersById } = state.users;
    const userId = state.login.id;
    const cycleId = parseInt(ownProps.match.params.cycleId);
    const runId = parseInt(ownProps.match.params.runId);

    let cycle = cyclesById[cycleId];
    let run, testSuiteVersionData;
    if (cycle) {
        run = cycle.runsById[runId];
        testSuiteVersionData = testSuiteVersions.find(
            v => v.id === cycle.test_version_id
        );
    }

    let tests = undefined;
    if (runsForCycle && runsForCycle[cycleId] && runsForCycle[cycleId][runId]) {
        tests = runsForCycle[cycleId][runId].tests;
    }

    return {
        cycle,
        cycleId,
        run,
        tests,
        testSuiteVersionData,
        usersById,
        userId
    };
};

export default connect(mapStateToProps)(TestRun);
