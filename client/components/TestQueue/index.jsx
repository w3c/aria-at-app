import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { getTestsForRunsCycle } from '../../actions/cycles';
import { getAllUsers } from '../../actions/users';
import { getActiveRuns } from '../../actions/runs';
import nextId from 'react-id-generator';

import TestQueueRun from '@components/TestQueueRun';

class TestQueue extends Component {
    componentDidMount() {
        const { dispatch, activeRunsById, usersById } = this.props;

        if (!activeRunsById) {
            dispatch(getActiveRuns());
        }

        if (!Object.keys(usersById).length) {
            dispatch(getAllUsers());
        }

        // TODO: Add better caching/cache invalidation.
        // Right now, everytime we go to the test queue page, we will fetch
        // the test results.
        dispatch(getTestsForRunsCycle());
    }

    renderAtBrowserList(runIds) {
        const {
            userId,
            usersById,
            testsByRunId,
            admin,
            activeRunsById
        } = this.props;
        const {
            at_name: atName,
            at_version: atVersion,
            browser_name: browserName,
            browser_version: browserVersion
        } = activeRunsById[runIds[0]];

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
                            const run = activeRunsById[runId];
                            const {
                                apg_example_name,
                                testers,
                                at_name_id,
                                run_status,
                                id
                            } = run;
                            return (
                                <TestQueueRun
                                    key={id}
                                    runId={id}
                                    runStatus={run_status}
                                    apgExampleName={apg_example_name}
                                    testers={testers}
                                    usersById={usersById}
                                    userId={userId}
                                    atName={atName}
                                    atNameId={at_name_id}
                                    browserName={browserName}
                                    testsForRun={testsByRunId[id]}
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
            testsFetched,
            usersById,
            userId,
            admin,
            activeRunsById
        } = this.props;

        const loading = <div data-test="test-queue-loading">Loading</div>;

        if (
            !testsFetched ||
            !activeRunsById ||
            !Object.keys(usersById).length
        ) {
            return loading;
        }

        const currentUser = usersById[userId];

        if (!currentUser) {
            return loading;
        }

        let configuredAtNameIds = currentUser.configured_ats.map(
            a => a.at_name_id
        );

        if (!configuredAtNameIds.length) {
            const noAts = 'No Assistive Technologies Configured';
            const settingsLink = <Link to="/account/settings">Settings</Link>;
            return (
                <Fragment>
                    <Helmet>
                        <title>{noAts} | ARIA-AT</title>
                    </Helmet>
                    <h2 data-test="test-queue-no-ats-h2">{noAts}</h2>
                    <p data-test="test-queue-no-ats-p">
                        To contribute tests, please configure the relevant
                        Assistive Technologies in {settingsLink}
                    </p>
                </Fragment>
            );
        }

        const atBrowserRunSets = [];
        for (let runId of Object.keys(activeRunsById)) {
            const run = activeRunsById[runId];
            const { at_name_id, at_name, browser_name } = run;

            // If you are not an admin, you cannot see runs you cannot perform
            if (!admin) {
                if (!configuredAtNameIds.includes(at_name_id)) {
                    continue;
                }
            }

            let atBrowserRun = atBrowserRunSets.filter(r => {
                return r.at_name === at_name && r.browser_name === browser_name;
            });

            if (atBrowserRun.length === 1) {
                atBrowserRun[0].runs.push(run.id);
            } else {
                atBrowserRunSets.push({
                    at_name,
                    browser_name,
                    runs: [run.id]
                });
            }
        }

        return (
            <Fragment>
                <Helmet>
                    <title>{`Test queue | ARIA-AT`}</title>
                </Helmet>
                <h1>Test Queue</h1>
                <p>
                    {// This style of setting the paragraph string
                    //  allows the react/no-unescaped-entities error
                    //  to disappear in eslint.
                    `Assign yourself a test plan or start executing one that it's
                        already assigned to you.`}
                </p>
                {atBrowserRunSets.map(abr =>
                    this.renderAtBrowserList(abr.runs)
                )}
            </Fragment>
        );
    }
}

TestQueue.propTypes = {
    activeRunsById: PropTypes.object,
    admin: PropTypes.bool,
    testsByRunId: PropTypes.object,
    usersById: PropTypes.object,
    userId: PropTypes.number,
    testsFetched: PropTypes.bool,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { activeRunsById } = state.runs;
    const { testsByRunId } = state.cycles;
    const { usersById } = state.users;
    const userId = state.user.id;
    const roles = state.user.roles;
    let testsFetched = true;

    if (!activeRunsById) {
        testsFetched = false;
    } else {
        for (let runId of Object.keys(activeRunsById)) {
            if (!testsByRunId[runId]) {
                testsFetched = false;
                break;
            }
        }
    }

    let admin = (roles || []).includes('admin');

    return {
        activeRunsById,
        testsByRunId,
        testsFetched,
        usersById,
        userId,
        admin
    };
};

export default connect(mapStateToProps)(TestQueue);
