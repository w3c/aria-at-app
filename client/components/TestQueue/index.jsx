import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { getTestCycles, getRunsForUserAndCycle } from '../../actions/cycles';
import { getAllUsers } from '../../actions/users';

class TestQueue extends Component {
    componentDidMount() {
        const { dispatch, cycle, cycleId, testsForRuns, users } = this.props;
        if (!cycle) {
            dispatch(getTestCycles());
        }

        if (!users.length) {
            dispatch(getAllUsers());
        }

        if (!testsForRuns) {
            dispatch(getRunsForUserAndCycle(cycleId));
        }
    }

    renderRunRow(run) {
        const { cycleId, userId, users } = this.props;

        let currentUserAssigned = run.testers.includes(userId);

        // TODO: Fix when users is a mapped id => user object
        let userNames = run.testers.map(uid => {
            return users.find(u => u.id === uid).fullname;
        });

        let designPatternLinkOrName;
        if (currentUserAssigned) {
            designPatternLinkOrName = (
                <Link to={`/cycle/${cycleId}/run-tests/${run.id}`}>
                    {run.apg_example_name}
                </Link>
            );
        } else {
            designPatternLinkOrName = run.apg_example_name;
        }

        return (
            <tr key={run.id}>
                <td>{designPatternLinkOrName}</td>
                <td>{userNames.join(', ')}</td>
                <td>status</td>
                <td>actions</td>
            </tr>
        );
    }

    renderAtBrowserList(runs) {
        const { at_name, at_version, browser_name, browser_version } = runs[0];

        return (
            <div key={`${at_name}${browser_name}`}>
                <h3>{`${at_name} ${at_version} with ${browser_name} ${browser_version}`}</h3>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Test Plan</th>
                            <th>Testers</th>
                            <th>Report Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>{runs.map(run => this.renderRunRow(run))}</tbody>
                </Table>
            </div>
        );
    }

    render() {
        const { cycle, cycleId, testsForRuns, users, userId } = this.props;

        if (!testsForRuns || !cycle || !users.length) {
            return <div>Loading</div>;
        }

        let currentUser = users.find(u => u.id === userId);
        let configuredAtNames = currentUser.configured_ats.map(a => a.at_name);

        let atBrowserRunSets = [];
        if (cycle) {
            for (let run of cycle.runs) {
                const { at_name, browser_name } = run;

                if (!configuredAtNames.includes(at_name)) {
                    continue;
                }

                let atBrowserRun = atBrowserRunSets.filter(r => {
                    return (
                        r.at_name === at_name && r.browser_name === browser_name
                    );
                });

                if (atBrowserRun.length === 1) {
                    atBrowserRun[0].runs.push(run);
                } else {
                    atBrowserRunSets.push({
                        at_name,
                        browser_name,
                        runs: [run]
                    });
                }
            }
        }

        return (
            <Fragment>
                <h2>
                    Test Run Queue For Test Cycle:{' '}
                    {cycle ? cycle.name : cycleId}
                </h2>
                {atBrowserRunSets.map(abr =>
                    this.renderAtBrowserList(abr.runs)
                )}
            </Fragment>
        );
    }
}

TestQueue.propTypes = {
    cycle: PropTypes.object,
    cycleId: PropTypes.number,
    testsForRuns: PropTypes.object,
    users: PropTypes.array,
    userId: PropTypes.number,
    dispatch: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    const { cycles, runsForCycle } = state.cycles;
    const { users } = state.users;
    const userId = state.login.id;
    const cycleId = parseInt(ownProps.match.params.cycleId);

    let cycle = undefined;
    for (let c of cycles) {
        if (c.id === cycleId) {
            cycle = c;
            break;
        }
    }

    let testsForRuns = undefined;
    if (runsForCycle && runsForCycle[cycleId]) {
        testsForRuns = runsForCycle[cycleId];
    }

    return { cycle, cycleId, testsForRuns, users, userId };
};

export default connect(mapStateToProps)(TestQueue);
