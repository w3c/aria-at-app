import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TestRun.css';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import Button from 'react-bootstrap/Button';
import { getTestCycles, getRunsForUserAndCycle } from '../../actions/cycles';

class TestRun extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTestIndex: 1,
            runComplete: false
        };

        this.nextTest = this.nextTest.bind(this);
    }

    async componentDidMount() {
        const { dispatch, cycleId, tests } = this.props;
        if (!tests) {
            dispatch(getTestCycles());
            dispatch(getRunsForUserAndCycle(cycleId));
        }
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
        const { run, tests } = this.props;

        if (!run || !tests) {
            return <div data-test="test-run-loading">Loading</div>;
        }

        const {
            apg_example_name,
            at_name,
            at_version,
            browser_name,
            browser_version
        } = run;

        let testName,
            testsToRun = false;
        if (tests.length > 0) {
            const { name } = tests[this.state.currentTestIndex - 1];
            testName = name;
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
                content = (
                    <React.Fragment>
                        <iframe
                            src={`/${
                                tests[this.state.currentTestIndex - 1].file
                            }`}
                            id="test-iframe"
                        ></iframe>
                        <Button variant="primary" onClick={this.nextTest}>
                            Next test
                        </Button>
                    </React.Fragment>
                );
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
    tests: PropTypes.array,
    run: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
    const { cyclesById, runsForCycle } = state.cycles;
    const { users } = state.users;
    const userId = state.login.id;
    const cycleId = parseInt(ownProps.match.params.cycleId);
    const runId = parseInt(ownProps.match.params.runId);

    let cycle = cyclesById[cycleId];
    let run;
    if (cycle) run = cycle.runsById[runId];

    let tests = undefined;
    if (runsForCycle && runsForCycle[cycleId] && runsForCycle[cycleId][runId]) {
        tests = runsForCycle[cycleId][runId].tests;
    }

    return { cycle, cycleId, run, tests, users, userId };
};

export default connect(mapStateToProps)(TestRun);
