import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { getTestCycles, getTestsForRunsCycle } from '../../actions/cycles';
import { getAllUsers } from '../../actions/users';
import nextId from 'react-id-generator';

import TestQueueRun from '@components/TestQueueRun';

class TestQueue extends Component {
    componentDidMount() {
        const {
            dispatch,
            cycle,
            cycleId,
            testsFetched,
            usersById
        } = this.props;
        if (!cycle) {
            dispatch(getTestCycles());
        }

        if (!Object.keys(usersById).length) {
            dispatch(getAllUsers());
        }

        if (!testsFetched) {
            dispatch(getTestsForRunsCycle(cycleId));
        }
    }

    renderAtBrowserList(runIds) {
        const { userId, usersById, cycle, testsByRunId, admin } = this.props;
        const {
            at_name: atName,
            at_version: atVersion,
            browser_name: browserName,
            browser_version: browserVersion
        } = cycle.runsById[runIds[0]];

        let tableId = nextId('table_name_');

        return (
            <div key={`${atName}${browserName}`}>
                <h3
                    id={tableId}
                >{`${atName} ${atVersion} with ${browserName} ${browserVersion}`}</h3>
                <Table aria-labelledby={tableId} striped bordered hover>
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
                                testers,
                                at_name_id
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
                                    atNameId={at_name_id}
                                    browserName={browserName}
                                    testsForRun={testsByRunId[runId]}
                                    admin={admin}
                                />
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        );
    }

    render() {
        const {
            cycle,
            cycleId,
            testsFetched,
            usersById,
            userId,
            admin
        } = this.props;

        if (!testsFetched || !cycle || !Object.keys(usersById).length) {
            return <div>Loading</div>;
        }
        let currentUser = usersById[userId];
        let configuredAtNameIds = currentUser.configured_ats.map(
            a => a.at_name_id
        );

        let atBrowserRunSets = [];
        if (cycle) {
            for (let runId in cycle.runsById) {
                const run = cycle.runsById[runId];
                const { at_name_id, at_name, browser_name } = run;

                // If you are not an admin, you cannot see runs you cannot perform
                if (!admin) {
                    if (!configuredAtNameIds.includes(at_name_id)) {
                        continue;
                    }
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
    admin: PropTypes.number,
    cycle: PropTypes.object,
    cycleId: PropTypes.number,
    testsByRunId: PropTypes.object,
    usersById: PropTypes.object,
    userId: PropTypes.number,
    testsFetched: PropTypes.bool,
    dispatch: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    const { cyclesById, testsByRunId } = state.cycles;
    const { usersById } = state.users;
    const userId = state.user.id;
    const roles = state.user.roles;
    const cycleId = parseInt(ownProps.match.params.cycleId);

    let cycle = cyclesById[cycleId];
    let testsFetched = true;
    if (!cycle) {
        testsFetched = false;
    } else {
        for (let runId of Object.keys(cycle.runsById)) {
            if (!testsByRunId[runId]) {
                testsFetched = false;
                break;
            }
        }
    }

    let admin = roles.includes('admin');
    return {
        cycle,
        cycleId,
        testsByRunId,
        testsFetched,
        usersById,
        userId,
        admin
    };
};

export default connect(mapStateToProps)(TestQueue);
