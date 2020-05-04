import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import {
    getTestSuiteVersions,
    getTestCycles,
    deleteUsersFromRun,
    saveUsersToRuns
} from '../../actions/cycles';
import { getAllUsers } from '../../actions/users';
import ConfigureRunsForExample from '@components/ConfigureRunsForExample';

class CycleSummary extends Component {
    constructor(props) {
        super(props);

        this.assignTesters = this.assignTesters.bind(this);
        this.removeAllTestersFromRun = this.removeAllTestersFromRun.bind(this);
    }

    componentDidMount() {
        const { dispatch, cycle, usersById, testSuiteVersionData } = this.props;

        if (!cycle) {
            dispatch(getTestCycles());
        }
        if (!Object.keys(usersById).length) {
            dispatch(getAllUsers());
        }
        if (!testSuiteVersionData) {
            dispatch(getTestSuiteVersions());
        }
    }

    assignTesters(exampleId, runIds, userId) {
        const { dispatch, cycle } = this.props;
        dispatch(saveUsersToRuns([userId], runIds, cycle.id));
    }

    removeAllTestersFromRun(exampleId, runId) {
        const { dispatch, cycle } = this.props;
        let userIds = cycle.runsById[runId].testers;
        dispatch(deleteUsersFromRun([userIds], runId, cycle.id));
    }

    render() {
        const { cycle, usersById, testSuiteVersionData } = this.props;

        if (!cycle || !testSuiteVersionData) {
            return <div>Loading..</div>;
        }

        let runsByExample = {};
        let testerByRunId = {};

        let technologySetTest = {};
        let technologySets = [];

        for (let runId in cycle.runsById) {
            let run = cycle.runsById[runId];
            if (runsByExample[run.apg_example_id]) {
                runsByExample[run.apg_example_id].push(run);
            } else {
                runsByExample[run.apg_example_id] = [run];
            }
            testerByRunId[runId] = run.testers;

            if (!technologySetTest[`${run.browser_name}${run.at_name}`]) {
                technologySetTest[`${run.browser_name}${run.at_name}`] = true;
                technologySets.push({
                    at_name: run.at_name,
                    at_version: run.at_version,
                    browser_name: run.browser_name,
                    browser_version: run.browser_version
                });
            }
        }

        return (
            <Fragment>
                <Helmet>
                    <title>
                        Test Management (for cycle: {cycle.name}) | ARIA-AT
                    </title>
                </Helmet>
                <h2>{cycle.name} - Status</h2>
                <h3>Git commit of tests</h3>
                <p>{`${
                    testSuiteVersionData.git_commit_msg
                } - ${testSuiteVersionData.git_hash.slice(0, 8)}`}</p>
                <h3>Configured assistive technologies and browser versions</h3>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Assisitve Technology</th>
                            <th>AT Version</th>
                            <th>Browser</th>
                            <th>Browser Version</th>
                        </tr>
                    </thead>
                    <tbody>
                        {technologySets.map((set, index) => {
                            return (
                                <tr key={index}>
                                    <td>{set.at_name}</td>
                                    <td>{set.at_version}</td>
                                    <td>{set.browser_name}</td>
                                    <td>{set.browser_version}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
                <h3>Test Plans</h3>
                {testSuiteVersionData &&
                    testSuiteVersionData.apg_examples.map(example => {
                        return (
                            <ConfigureRunsForExample
                                runs={runsByExample[example.id]}
                                key={example.id}
                                example={example}
                                usersById={usersById}
                                assignTesters={this.assignTesters}
                                removeAllTestersFromRun={
                                    this.removeAllTestersFromRun
                                }
                                testersByRunId={testerByRunId}
                            />
                        );
                    })}
            </Fragment>
        );
    }
}

CycleSummary.propTypes = {
    cycle: PropTypes.object,
    dispatch: PropTypes.func,
    usersById: PropTypes.object,
    testSuiteVersionData: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
    const { cyclesById, testSuiteVersions } = state.cycles;
    const { usersById } = state.users;

    const cycleId = parseInt(ownProps.match.params.cycleId);

    let cycle = cyclesById[cycleId];
    let testSuiteVersionData = undefined;
    if (cycle) {
        testSuiteVersionData = testSuiteVersions.find(
            v => v.id === cycle.test_version_id
        );
    }

    return { cycle, usersById, testSuiteVersionData };
};

export default connect(mapStateToProps)(CycleSummary);
