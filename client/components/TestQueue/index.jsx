import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Container, Table, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import nextId from 'react-id-generator';
import TestQueueRow from '../TestQueueRow';
import ManageTestQueue from '../ManageTestQueue';
import DeleteTestPlanReportModal from '../DeleteTestPlanReportModal';
import DeleteResultsModal from '../DeleteResultsModal';
import PageStatus from '../common/PageStatus';
import { TEST_QUEUE_PAGE_QUERY } from './queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import './TestQueue.css';

const TestQueue = () => {
    const { loading, data, error, refetch } = useQuery(TEST_QUEUE_PAGE_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    const [pageReady, setPageReady] = useState(false);
    const [testers, setTesters] = useState([]);
    const [ats, setAts] = useState([]);
    const [testPlanVersions, setTestPlanVersions] = useState([]);
    const [testPlanReports, setTestPlanReports] = useState([]);
    const [latestTestPlanVersions, setLatestTestPlanVersions] = useState([]);
    const [structuredTestPlanTargets, setStructuredTestPlanTargets] = useState(
        {}
    );
    const [deleteTestPlanReportDetails, setDeleteTestPlanReportDetails] =
        useState({});
    const [isShowingDeleteTestPlanReportModal, setDeleteTestPlanReportModal] =
        useState(false);
    const [deleteResultsDetails, setDeleteResultsDetails] = useState({});
    const [isShowingDeleteResultsModal, setDeleteResultsModal] =
        useState(false);

    const auth = evaluateAuth(data && data.me ? data.me : {});
    const { id, isAdmin } = auth;
    const isSignedIn = !!id;

    useEffect(() => {
        if (data) {
            const {
                users = [],
                ats = [],
                testPlanVersions = [],
                testPlanReports = [],
                testPlans = []
            } = data;
            setTesters(
                users.filter(
                    tester =>
                        tester.roles.includes('TESTER') ||
                        tester.roles.includes('ADMIN')
                )
            );
            setAts(ats);
            setTestPlanVersions(testPlanVersions);
            setTestPlanReports(testPlanReports);
            setLatestTestPlanVersions(testPlans);
            setPageReady(true);
        }
    }, [data]);

    useEffect(() => {
        const structuredTestPlanTargets =
            generateStructuredTestPlanVersions(testPlanReports);
        setStructuredTestPlanTargets(structuredTestPlanTargets);
    }, [testPlanReports]);

    const generateStructuredTestPlanVersions = testPlanReports => {
        const structuredData = {};

        // get all testPlanTargets grouped to make it easier to drop into TestQueue table
        testPlanReports.forEach(testPlanReport => {
            const title = `${testPlanReport.at?.name} and ${testPlanReport.browser?.name}`;
            if (!structuredData[title]) {
                structuredData[title] = [testPlanReport];
            } else {
                structuredData[title].push(testPlanReport);
            }
        });

        return structuredData;
    };

    const renderAtBrowserList = (title = '', testPlanReports = []) => {
        // means structuredTestPlanTargets would have been generated
        if (!testPlanReports.length) return null;

        const tableId = nextId('table_name_');

        return (
            <div key={title}>
                <h2 id={tableId}>{title}</h2>
                <Table
                    className="test-queue"
                    aria-labelledby={tableId}
                    bordered
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
                        {testPlanReports.map(testPlanReport => {
                            const key = `test_plan_report_${testPlanReport.id}`;
                            return (
                                <TestQueueRow
                                    key={key}
                                    user={auth}
                                    testers={testers.sort((a, b) =>
                                        a.username.localeCompare(b.username)
                                    )}
                                    testPlanReportData={testPlanReport}
                                    latestTestPlanVersions={
                                        latestTestPlanVersions
                                    }
                                    triggerDeleteTestPlanReportModal={
                                        triggerDeleteTestPlanReportModal
                                    }
                                    triggerDeleteResultsModal={
                                        triggerDeleteResultsModal
                                    }
                                    triggerPageUpdate={refetch}
                                />
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        );
    };

    const triggerDeleteTestPlanReportModal = (
        id = null,
        title = null,
        deleteFunction = () => {}
    ) => {
        setDeleteTestPlanReportDetails({ id, title, deleteFunction });
        setDeleteTestPlanReportModal(true);
    };

    const handleDeleteTestPlanReport = async () => {
        handleCloseDeleteTestPlanReportModal();

        if (deleteTestPlanReportDetails.deleteFunction)
            await deleteTestPlanReportDetails.deleteFunction();

        // reset deleteTestPlanDetails
        setDeleteTestPlanReportDetails({});
    };

    const handleCloseDeleteTestPlanReportModal = () =>
        setDeleteTestPlanReportModal(false);

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
        setDeleteResultsModal(true);
    };

    const handleDeleteResults = async () => {
        handleCloseDeleteResultsModal();

        if (deleteResultsDetails.deleteFunction)
            await deleteResultsDetails.deleteFunction();

        // reset deleteResultsDetails
        setDeleteResultsDetails({});
    };

    const handleCloseDeleteResultsModal = () => setDeleteResultsModal(false);

    if (error) {
        return (
            <PageStatus
                title="Test Queue | ARIA-AT"
                heading="Test Queue"
                message={error.message}
                isError
            />
        );
    }

    if (loading || !pageReady) {
        return (
            <PageStatus
                title="Loading - Test Queue | ARIA-AT"
                heading="Test Queue"
            />
        );
    }

    const emptyTestPlans = !testPlanReports.length;
    const noTestPlansMessage = 'There are no test plans available';
    const settingsLink = <Link to="/account/settings">Settings</Link>;

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>{`${
                    emptyTestPlans ? noTestPlansMessage : 'Test Queue'
                } | ARIA-AT`}</title>
            </Helmet>
            <h1>Test Queue</h1>
            {emptyTestPlans && (
                <h2 data-testid="test-queue-no-test-plans-h2">
                    {noTestPlansMessage}
                </h2>
            )}
            {emptyTestPlans && !isAdmin && isSignedIn && (
                <Alert
                    key="alert-configure"
                    variant="danger"
                    data-testid="test-queue-no-test-plans-p"
                >
                    Please configure your preferred Assistive Technologies in
                    the {settingsLink} page.
                </Alert>
            )}

            {emptyTestPlans && isAdmin && (
                <Alert
                    key="alert-configure"
                    variant="danger"
                    data-testid="test-queue-no-test-plans-p"
                >
                    Add a Test Plan to the Queue
                </Alert>
            )}

            {!emptyTestPlans && (
                <p data-testid="test-queue-instructions">
                    {isSignedIn
                        ? 'Assign yourself a test plan or start executing one that is already assigned to you.'
                        : 'Select a test plan to view. Your results will not be saved.'}
                </p>
            )}

            {isAdmin && (
                <ManageTestQueue
                    ats={ats}
                    testPlanVersions={testPlanVersions}
                    triggerUpdate={refetch}
                />
            )}

            {!emptyTestPlans &&
                Object.keys(structuredTestPlanTargets).map(key =>
                    renderAtBrowserList(key, structuredTestPlanTargets[key])
                )}

            {isSignedIn && (
                <DeleteResultsModal
                    show={isShowingDeleteResultsModal}
                    isAdmin={isAdmin}
                    details={deleteResultsDetails}
                    handleClose={handleCloseDeleteResultsModal}
                    handleAction={handleDeleteResults}
                />
            )}

            {isAdmin && isShowingDeleteTestPlanReportModal && (
                <DeleteTestPlanReportModal
                    show={isShowingDeleteTestPlanReportModal}
                    details={deleteTestPlanReportDetails}
                    handleClose={handleCloseDeleteTestPlanReportModal}
                    handleAction={handleDeleteTestPlanReport}
                />
            )}
        </Container>
    );
};

export default TestQueue;
