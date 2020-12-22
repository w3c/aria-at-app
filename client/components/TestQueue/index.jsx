import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Container, Table, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { getAllUsers } from '../../actions/users';
import { getActiveRuns } from '../../actions/runs';
import nextId from 'react-id-generator';
import TestQueueRun from '@components/TestQueueRun';
import DeleteResultsModal from '@components/DeleteResultsModal';
import './TestQueue.css';

class TestQueue extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showDeleteResultsModal: false,
            resultsDelete: {
                username: '',
                run: null
            },
            deleteFunction: null
        };

        this.deleteResults = this.deleteResults.bind(this);
        this.showDeleteResultsModal = this.showDeleteResultsModal.bind(this);
        this.closeDeleteResultsModal = this.closeDeleteResultsModal.bind(this);
    }

    componentDidMount() {
        const { dispatch, activeRunsById, usersById } = this.props;

        if (!activeRunsById) {
            dispatch(getActiveRuns());
        }

        if (!Object.keys(usersById).length) {
            dispatch(getAllUsers());
        }
    }

    async deleteResults() {
        await this.state.deleteFunction();
        this.closeDeleteResultsModal();
    }

    showDeleteResultsModal(username, run, deleteFunction) {
        this.setState({
            showDeleteResultsModal: true,
            resultsDelete: {
                username,
                run
            },
            deleteFunction
        });
    }

    closeDeleteResultsModal() {
        this.setState({ showDeleteResultsModal: false });
    }

    renderAtBrowserList(runIds) {
        const { admin, activeRunsById } = this.props;
        const {
            at_name: atName,
            at_version: atVersion,
            browser_name: browserName,
            browser_version: browserVersion
        } = activeRunsById[runIds[0]];

        let tableId = nextId('table_name_');

        return (
            <div key={`${atName}${atVersion}${browserName}${browserVersion}`}>
                <h2
                    id={tableId}
                >{`${atName} ${atVersion} with ${browserName} ${browserVersion}`}</h2>
                <Table
                    className="test-queue"
                    aria-labelledby={tableId}
                    striped
                    bordered
                    hover
                >
                    <thead>
                        <tr>
                            <th className="test-plan">Test Plan</th>
                            <th className="testers">Testers</th>
                            <th className="report-status">Report Status</th>
                            <th className="actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {runIds.map(runId => {
                            return (
                                <TestQueueRun
                                    key={runId}
                                    runId={runId}
                                    atName={atName}
                                    browserName={browserName}
                                    admin={admin}
                                    deleteResults={this.deleteResults}
                                    showDeleteResultsModal={
                                        this.showDeleteResultsModal
                                    }
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
            const noAts = 'There are no Test Plans available';
            const settingsLink = <Link to="/account/settings">Settings</Link>;
            return (
                <Container as="main">
                    <Helmet>
                        <title>{noAts} | ARIA-AT</title>
                    </Helmet>
                    <h2 data-test="test-queue-no-ats-h2">{noAts}</h2>
                    <Alert
                        key="alert-configure"
                        variant="danger"
                        data-test="test-queue-no-ats-p"
                    >
                        Please configure your preferred Assistive Technologies
                        in the {settingsLink} page.
                    </Alert>
                </Container>
            );
        }

        const atBrowserRunSets = [];
        for (let runId of Object.keys(activeRunsById)) {
            const run = activeRunsById[runId];
            const {
                at_name_id,
                at_name,
                browser_name,
                browser_version,
                at_version
            } = run;

            // If you are not an admin, you cannot see runs you cannot perform
            if (!admin) {
                if (!configuredAtNameIds.includes(at_name_id)) {
                    continue;
                }
            }

            let atBrowserRun = atBrowserRunSets.filter(r => {
                return (
                    r.at_name === at_name &&
                    r.at_version === at_version &&
                    r.browser_name === browser_name &&
                    r.browser_version === browser_version
                );
            });

            if (atBrowserRun.length === 1) {
                atBrowserRun[0].runs.push(run.id);
            } else {
                atBrowserRunSets.push({
                    at_name,
                    at_version,
                    browser_name,
                    browser_version,
                    runs: [run.id]
                });
            }
        }

        if (atBrowserRunSets.length === 0) {
            return (
                <Container as="main">
                    <Helmet>
                        <title>No Test Plans | ARIA-AT</title>
                    </Helmet>
                    <h2 data-test="test-queue-no-ats-h2">No Test Plans</h2>
                    <div role="alert">
                        <p>
                            If you have configured your Assistive Technologies
                            and are still not seeing any Test Plans in this
                            page, it could be that there are no Test Plans
                            available under your configuration.
                            <p></p>
                            Please{' '}
                            <a href="mailto: public-aria-at@w3.org">
                                contact the ARIA AT community group
                            </a>
                            .
                        </p>
                    </div>
                </Container>
            );
        }

        return (
            <Container as="main">
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
                <DeleteResultsModal
                    show={this.state.showDeleteResultsModal}
                    handleClose={this.closeDeleteResultsModal}
                    user={this.state.resultsDelete.username}
                    run={this.state.resultsDelete.run}
                    admin={admin}
                    deleteResults={this.deleteResults}
                />
            </Container>
        );
    }
}

TestQueue.propTypes = {
    activeRunsById: PropTypes.object,
    admin: PropTypes.bool,
    usersById: PropTypes.object,
    userId: PropTypes.number,
    testsFetched: PropTypes.bool,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { activeRunsById } = state.runs;
    const { usersById } = state.users;
    const userId = state.user.id;
    const roles = state.user.roles;
    let testsFetched = true;

    let admin = (roles || []).includes('admin');

    return {
        activeRunsById,
        testsFetched,
        usersById,
        userId,
        admin
    };
};

export default connect(mapStateToProps)(TestQueue);
