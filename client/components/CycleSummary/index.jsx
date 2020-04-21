import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, Button } from 'react-bootstrap';
import { getTestSuiteVersions, getTestCycles } from '../../actions/cycles';
import { getAllUsers } from '../../actions/users';
import ConfigureTechnologyRow from '@components/ConfigureTechnologyRow';
import ConfigureRunsForExample from '@components/ConfigureRunsForExample';

class CycleSummary extends Component {
    constructor(props) {
        super(props);

        this.assignTesters = this.assignTesters.bind(this);
        this.removeAllTestersFromRun = this.removeAllTestersFromRun.bind(this);
    }

    componentDidMount() {
        const { dispatch, cycle, users, testSuiteVersionData } = this.props;

        if (!cycle) {
            dispatch(getTestCycles());
        }
        if (!users.length) {
            dispatch(getAllUsers());
        }
        if (!testSuiteVersionData) {
            dispatch(getTestSuiteVersions());
        }
    }

    assignTesters(exampleId, runIds, userId) {
        console.log("assigning users");
    }

    removeAllTestersFromRun(exampleId, runTechnologyIndexes) {
        console.log("removing users");
    }

    render() {
        const { cycle, users, testSuiteVersionData } = this.props;

        if (!cycle) {
            return <div>LOADING</div>
        }

        let runsByExample = {};
        for (let run of cycle.runs) {
            if (runsByExample[run.apg_example_id]) {
                runsByExample[run.apg_example_id].push(run);
            }
            else {
                runsByExample[run.apg_example_id] = [run];
            }
        }

        console.log(cycle);
        console.log("runsByExample", runsByExample);

        return (
            <Fragment>
                <h2>{cycle.name}</h2>
                <h3>Test Plans</h3>
                {testSuiteVersionData &&
                    testSuiteVersionData.apg_examples.map(example => {
                        console.log("example.id", example.id);
                        return (
                            <ConfigureRunsForExample
                                runs={runsByExample[example.id]}
                                key={example.id}
                                example={example}
                                users={users}
                                assignTesters={this.assignTesters}
                                removeAllTestersFromRun={
                                    this.removeAllTestersFromRun
                                }
                                testersByRunId={
                                    {}
                                }
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
    users: PropTypes.array,
    testSuiteVersionData: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
    const { cycles, runsForCycle, testSuiteVersions } = state.cycles;
    const { users } = state.users;

    const cycleId = parseInt(ownProps.match.params.cycleId);

    let cycle = undefined;
    for (let c of cycles) {
        if (c.id === cycleId) {
            cycle = c;
            break;
        }
    }

    let testSuiteVersionData = undefined;
    if (cycle) {
        testSuiteVersionData = testSuiteVersions.find(v => v.id === cycle.test_version_id);
    }

    return { cycle, users, testSuiteVersionData };
};

export default connect(mapStateToProps)(CycleSummary);
