import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Col, Container, Row } from 'react-bootstrap';
import nextId from 'react-id-generator';
import {
    getTestCycles,
    getTestsForRunsCycle,
    getTestSuiteVersions,
    saveResult
} from '../../actions/cycles';
import DisplayTest from '@components/DisplayTest';

class TestRun extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTestIndex: 1,
            runComplete: false
        };

        this.displayNextTest = this.displayNextTest.bind(this);
        this.displayPreviousTest = this.displayPreviousTest.bind(this);
        this.saveResultFromTest = this.saveResultFromTest.bind(this);
        this.deleteResultFromTest = this.deleteResultFromTest.bind(this);
    }

    async componentDidMount() {
        const { dispatch, cycleId, tests, testSuiteVersionData } = this.props;
        if (!tests) {
            dispatch(getTestCycles());
            dispatch(getTestsForRunsCycle(cycleId));
        }
        if (!testSuiteVersionData) {
            dispatch(getTestSuiteVersions());
        }
    }

    displayNextTest() {
        const { tests } = this.props;
        let newIndex = this.state.currentTestIndex + 1;
        if (newIndex === tests.length) {
            this.setState({
                runComplete: true
            });
        } else {
            this.setState({
                currentTestIndex: newIndex
            });
        }
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

    deleteResultFromTest() {
        const { dispatch, cycleId, tests, run, userId } = this.props;
        const test = tests[this.state.currentTestIndex - 1];
        dispatch(
            saveResult({
                test_id: test.id,
                run_id: run.id,
                cycle_id: cycleId,
                user_id: userId,
                skip: true
            })
        );
        return true;
    }

    render() {
        const {
            run,
            tests,
            cycleId,
            testSuiteVersionData,
            userId
        } = this.props;

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

        let test,
            testsToRun = false;
        if (tests.length > 0) {
            test = tests[this.state.currentTestIndex - 1];
            testsToRun = true;
        }

        let heading = null;
        let content = null;
        let testContent = null;

        if (testsToRun) {
            heading = (
                <Fragment>
                    <h2 data-test="test-run-h2">
                        {' '}
                        {`${apg_example_name} (${this.state.currentTestIndex} of ${tests.length})`}
                    </h2>
                    <h3 data-test="test-run-h3">{`${at_name} ${at_version} with ${browser_name} ${browser_version}`}</h3>
                </Fragment>
            );

            if (!this.state.runComplete) {
                testContent = (
                    <DisplayTest
                        key={nextId()}
                        run={run}
                        test={test}
                        testIndex={this.state.currentTestIndex}
                        git_hash={git_hash}
                        at_key={at_key}
                        displayNextTest={this.displayNextTest}
                        displayPreviousTest={this.displayPreviousTest}
                        saveResultFromTest={this.saveResultFromTest}
                        deleteResultFromTest={this.deleteResultFromTest}
                        cycleId={cycleId}
                        userId={userId}
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

                    {testContent || (
                        <Row>
                            <Col>{content}</Col>
                        </Row>
                    )}
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
    const { cyclesById, testsByRunId, testSuiteVersions } = state.cycles;
    const { usersById } = state.users;
    const userId = state.user.id;
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
    if (testsByRunId[runId]) {
        tests = testsByRunId[runId];
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
