import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { getTestCycles, getRunsForUserAndCycle } from '../../actions/cycles';
import { getAllUsers } from '../../actions/users';

import TestQueueRun from '@components/TestQueueRun';

class TestQueue extends Component {
    componentDidMount() {
        const {
            dispatch,
            cycle,
            cycleId,
            testsForRuns,
            usersById
        } = this.props;
        if (!cycle) {
            dispatch(getTestCycles());
        }

        if (!Object.keys(usersById).length) {
            dispatch(getAllUsers());
        }

        if (!testsForRuns) {
            dispatch(getRunsForUserAndCycle(cycleId));
        }
    }

    renderAtBrowserList(runIds) {
        const { userId, usersById, cycle, testsForRuns } = this.props;
        const {
            at_name: atName,
            at_version: atVersion,
            browser_name: browserName,
            browser_version: browserVersion
        } = cycle.runsById[runIds[0]];

        return (
            <div key={`${atName}${browserName}`}>
                <h3>{`${atName} ${atVersion} with ${browserName} ${browserVersion}`}</h3>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Test Plan</th>
                            <th>Testers</th>
                            <th>Report Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {runIds.map(runId => {
                            const {
                                apg_example_name: apgExampleName,
                                testers
                            } = cycle.runsById[runId];
                            return (
                                <TestQueueRun
                                    key={runId}
                                    runId={runId}
                                    apgExampleName={apgExampleName}
                                    testers={testers}
                                    cycleId={cycle.id}
                                    usersById={usersById}
                                    userId={userId}
                                    atName={atName}
                                    browserName={browserName}
                                    testsForRun={testsForRuns[runId].tests}
                                />
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        );
    }

    render() {
        const { cycle, cycleId, testsForRuns, usersById, userId } = this.props;

        if (!testsForRuns || !cycle || !Object.keys(usersById).length) {
            return <div>Loading</div>;
        }

        let currentUser = usersById[userId];
        let configuredAtNames = currentUser.configured_ats.map(a => a.at_name);

        let atBrowserRunSets = [];
        if (cycle) {
            for (let runId in cycle.runsById) {
                const run = cycle.runsById[runId];
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
                    atBrowserRun[0].runIds.push(parseInt(runId));
                } else {
                    atBrowserRunSets.push({
                        at_name,
                        browser_name,
                        runIds: [parseInt(runId)]
                    });
                }
            }
        }

        return (
            <Fragment>
                <Helmet>
                    <title>{`Test queue (for cycle: ${cycle.name}) | ARIA-AT`}</title>
                </Helmet>
                <h2>
                    Test Run Queue For Test Cycle:{' '}
                    {cycle ? cycle.name : cycleId}
                </h2>
                {atBrowserRunSets.map(abr =>
                    this.renderAtBrowserList(abr.runIds)
                )}
            </Fragment>
        );
    }
}

TestQueue.propTypes = {
    cycle: PropTypes.object,
    cycleId: PropTypes.number,
    testsForRuns: PropTypes.object,
    usersById: PropTypes.object,
    userId: PropTypes.number,
    dispatch: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    const { cyclesById, runsForCycle } = state.cycles;
    const { usersById } = state.users;
    const userId = state.user.id;
    const cycleId = parseInt(ownProps.match.params.cycleId);

    let cycle = cyclesById[cycleId];

    let testsForRuns = undefined;
    if (runsForCycle && runsForCycle[cycleId]) {
        testsForRuns = runsForCycle[cycleId];
    }

    return { cycle, cycleId, testsForRuns, usersById, userId };
};

export default connect(mapStateToProps)(TestQueue);
