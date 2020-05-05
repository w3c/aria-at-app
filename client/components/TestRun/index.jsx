import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TestRun.css';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import Button from 'react-bootstrap/Button';
import {
    getTestCycles,
    getRunsForUserAndCycle,
    getTestSuiteVersions,
    saveResult
} from '../../actions/cycles';

class TestRun extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTestIndex: 1,
            runComplete: false,
            remindFinishTest: false
        };

        this.handleSkipTestClick = this.handleSkipTestClick.bind(this);
        this.handleNextTestClick = this.handleNextTestClick.bind(this);
        this.handleSaveResultClick = this.handleSaveResultClick.bind(this);

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

    handleSkipTestClick() {
        // TODO: show the popup Isaac designed here
        this.nextTest();
    }

    handleNextTestClick() {
        // This button just goes to next test. You will only see this button when "reviewing" previously saved test results.
        this.nextTest();
    }

    handleSaveResultClick() {
        const { dispatch, cycleId, tests, run, userId } = this.props;
        let resultsEl = this.testIframe.current.contentDocument.querySelector(
            '#__ariaatharness__results__'
        );

        if (!resultsEl) {
            // TODO: show popup here that says "You cannot save results until you complete and review the test"
            return;
        }

        const result = JSON.parse(resultsEl.innerHTML);
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

        this.nextTest();
    }

    nextTest() {
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

        let heading, content;

        if (testsToRun) {
            heading = (
                <React.Fragment>
                    <h2 data-test="test-run-h2">
                        {' '}
                        {`${apg_example_name} (${this.state.currentTestIndex} of ${tests.length})`}
                    </h2>
                    <h3 data-test="test-run-h3">{`${at_name} ${at_version} with ${browser_name} ${browser_version}`}</h3>
                    <h4 data-test="test-run-h4">Testing task: {testName}</h4>
                </React.Fragment>
            );
            if (!this.state.runComplete) {
                if (!test.result) {
                    content = (
                        <React.Fragment>
                            <iframe
                                src={`/aria-at/${git_hash}/${
                                    tests[this.state.currentTestIndex - 1].file
                                }?at=${at_key}`}
                                id="test-iframe"
                                ref={this.testIframe}
                            ></iframe>
                            <Button
                                variant="primary"
                                onClick={this.handleSkipTestClick}
                            >
                                Skip to next test
                            </Button>
                            <Button
                                variant="primary"
                                onClick={this.handleSaveResultClick}
                            >
                                Save results and go to next test
                            </Button>
                        </React.Fragment>
                    );
                } else {
                    content = (
                        <React.Fragment>
                            <div>
                                RESULTS EXIST!!!!!! TODO: Make a view of the
                                existng tests
                            </div>
                            <Button
                                variant="primary"
                                onClick={this.handleNextTestClick}
                            >
                                Go to next test
                            </Button>
                        </React.Fragment>
                    );
                }
            } else {
                content = (
                    <React.Fragment>
                        <div>Tests are complete.</div>
                    </React.Fragment>
                );
            }
        } else {
            heading = (
                <React.Fragment>
                    <h2>{`${apg_example_name}`}</h2>
                    <h3>{`${at_name} ${at_version} with ${browser_name} ${browser_version}`}</h3>
                </React.Fragment>
            );
            content = (
                <React.Fragment>
                    <div>No tests for this browser / AT combination</div>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <Helmet>
                    <title>{`Testing ${apg_example_name} for ${at_name} ${at_version} with ${browser_name} ${browser_version} | ARIA-AT`}</title>
                </Helmet>
                {heading}
                {content}
            </React.Fragment>
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
