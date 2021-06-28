import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Container, Table, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import nextId from 'react-id-generator';
import TestQueueRun from '../TestQueueRun';
import {
    AddTestPlanToQueueContainer,
    AddTestPlanToQueueModal
} from '../AddTestPlanToQueue';
import DeleteResultsModal from '../DeleteResultsModal';

import './TestQueue.css';

const TEST_PLAN_REPORTS_QUERY = gql`
    query {
        users {
            id
            username
            roles
        }
        testPlanReports(statuses: [DRAFT, IN_REVIEW]) {
            id
            status
            # conflictCount
            testPlanTarget {
                id
                title
                at {
                    id
                    name
                }
                browser {
                    id
                    name
                }
                atVersion
                browserVersion
            }
            testPlanVersion {
                id
                title
                gitSha
                gitMessage
                directory
                testCount
            }
            draftTestPlanRuns {
                id
                tester {
                    id
                    username
                }
                testResultCount
            }
        }
    }
`;

const TestQueue = ({ auth }) => {
    const { loading, data, refetch } = useQuery(TEST_PLAN_REPORTS_QUERY);

    const [testers, setTesters] = useState([]);
    const [testPlanReports, setTestPlanReports] = useState([]);
    const [structuredTestPlanTargets, setStructuredTestPlanTargets] = useState(
        {}
    );
    const [deleteResultsDetails, setDeleteResultsDetails] = useState({});
    const [isShowingDeleteResultsModal, enableDeleteResultsModal] = useState(
        false
    );
    const [isShowingAddToQueueModal, enableAddToQueueModal] = useState(false);

    const { isAdmin } = auth;

    useEffect(() => {
        if (data) {
            const { users = [], testPlanReports = [] } = data;
            setTesters(
                users.filter(
                    tester =>
                        tester.roles.includes('TESTER') ||
                        tester.roles.includes('ADMIN')
                )
            );
            setTestPlanReports(testPlanReports);
        }
    }, [data]);

    useEffect(() => {
        const structuredTestPlanTargets = generateStructuredTestPlanVersions(
            testPlanReports
        );
        setStructuredTestPlanTargets(structuredTestPlanTargets);
    }, [testPlanReports]);

    // TODO: this should probably be part of a resolver instead
    const generateStructuredTestPlanVersions = testPlanReports => {
        const structuredData = {};

        // get all testPlanTargets grouped to make it easier to drop into TestQueue table
        testPlanReports.forEach(testPlanReport => {
            if (!structuredData[testPlanReport.testPlanTarget.title]) {
                structuredData[testPlanReport.testPlanTarget.title] = [
                    testPlanReport
                ];
            } else {
                structuredData[testPlanReport.testPlanTarget.title].push(
                    testPlanReport
                );
            }
        });

        return structuredData;
    };

    const renderAtBrowserList = (title = '', testPlanReports = []) => {
        // means structuredTestPlanTargets would have been generated
        if (testPlanReports.length) {
            const tableId = nextId('table_name_');

            return (
                <div key={title}>
                    <h2 id={tableId}>{title}</h2>
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
                            {/* TODO: Iterate over collection of TestPlanReport/Versions? */}
                            {testPlanReports.map(testPlanReport => {
                                const id = nextId('test_queue_run_');
                                return (
                                    <TestQueueRun
                                        key={id}
                                        user={auth}
                                        testers={testers}
                                        testPlanReport={testPlanReport}
                                        triggerDeleteResultsModal={
                                            triggerDeleteResultsModal
                                        }
                                        triggerTestPlanReportUpdate={refetch}
                                    />
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            );
        }
        return null;
    };

    const triggerDeleteResultsModal = (
        title = null,
        username = null,
        deleteFunction = () => {}
    ) => {
        setDeleteResultsDetails({
            title,
            username,
            deleteFunction
        });

        enableDeleteResultsModal(true);
    };

    const handleDeleteResults = async () => {
        if (deleteResultsDetails.deleteFunction)
            await deleteResultsDetails.deleteFunction();
        handleCloseDeleteResultsModal();
    };

    const handleCloseDeleteResultsModal = () => {
        enableDeleteResultsModal(false);

        // reset deleteResultsDetails
        setDeleteResultsDetails({});
    };

    const handleCloseAddTestPlanToQueueModal = () => enableAddToQueueModal(false);

    if (loading) return <div data-test="test-queue-loading">Loading</div>;

    if (!isAdmin && !testPlanReports.length) {
        const noTestPlansMessage = 'There are no Test Plans available';
        const settingsLink = <Link to="/account/settings">Settings</Link>;

        return (
            <Container as="main">
                <Helmet>
                    <title>{noTestPlansMessage} | ARIA-AT</title>
                </Helmet>
                <h2 data-test="test-queue-no-test-plans-h2">
                    {noTestPlansMessage}
                </h2>
                <Alert
                    key="alert-configure"
                    variant="danger"
                    data-test="test-queue-no-test-plans-p"
                >
                    Please configure your preferred Assistive Technologies in
                    the {settingsLink} page.
                </Alert>
            </Container>
        );
    }

    return (
        <Container as="main">
            <Helmet>
                <title>{`Test Queue | ARIA-AT`}</title>
            </Helmet>
            <h1>Test Queue</h1>
            <p>
                Assign yourself a test plan or start executing one that is
                already assigned to you.
            </p>

            <AddTestPlanToQueueContainer
                handleOpenDialog={() => enableAddToQueueModal(true)}
            />

            {Object.keys(structuredTestPlanTargets).map(key =>
                renderAtBrowserList(key, structuredTestPlanTargets[key])
            )}
            <DeleteResultsModal
                show={isShowingDeleteResultsModal}
                isAdmin={isAdmin}
                title={deleteResultsDetails.title}
                username={deleteResultsDetails.username}
                handleClose={handleCloseDeleteResultsModal}
                handleDeleteResults={handleDeleteResults}
            />
            <AddTestPlanToQueueModal
                show={isShowingAddToQueueModal}
                handleClose={handleCloseAddTestPlanToQueueModal}
                handleAddToTestQueue={refetch}
            />
        </Container>
    );
};

TestQueue.propTypes = {
    auth: PropTypes.object
};

const mapStateToProps = state => {
    const { auth } = state;
    return { auth };
};

export default connect(mapStateToProps)(TestQueue);
