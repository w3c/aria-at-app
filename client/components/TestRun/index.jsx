import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
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
import DisplayTest from '@components/DisplayTest';

class TestRun extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTestIndex: 1,
            runComplete: false,
        };

        this.displayNextTest = this.displayNextTest.bind(this);
        this.displayPreviousTest = this.displayPreviousTest.bind(this);
        this.saveResultFromTest = this.saveResultFromTest.bind(this);
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

    displayNextTest() {
        const { tests } = this.props;
        this.setState(prevState => {
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
        });
    }

    displayPreviousTest() {
        this.setState({
            currentTestIndex: this.state.currentTestIndex - 1
        });
    }

    saveResultFromTest(result) {
        const { dispatch, cycleId, tests, run, userId } = this.props;
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

    render() {
        const { run, tests, cycleId, testSuiteVersionData } = this.props;

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
                testContent = (
                        <DisplayTest
                          test={test}
                          testIndex={this.state.currentTestIndex}
                          git_hash={git_hash}
                          at_key={at_key}
                          displayNextTest={this.displayNextTest}
                          displayPreviousTest={this.displayPreviousTest}
                          saveResultFromTest={this.saveResultFromTest}
                          cycleId={cycleId}
                        />
                    );
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
                        {testContent || <Col>{content}</Col>}
                    </Row>
                </Container>
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
    testSuiteVersionData: PropTypes.object
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
