import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Container, Table, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import nextId from 'react-id-generator';
import TestQueueRow from '../TestQueueRow';
import {
    NewTestPlanReportContainer,
    NewTestPlanReportModal
} from '../NewTestPlanReport';
import DeleteTestPlanReportModal from '../DeleteTestPlanReportModal';
import DeleteResultsModal from '../DeleteResultsModal';
import PageStatus from '../common/PageStatus';
import { TEST_QUEUE_PAGE_QUERY } from './queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import './TestQueue.css';

const ADD_TEST_PLAN_DIALOG_TRIGGER_ID = 'add-test-plan-to-queue-dialog-trigger';

const TestQueue = () => {
    const { loading, data, refetch } = useQuery(TEST_QUEUE_PAGE_QUERY);

    const [testers, setTesters] = useState([]);
    const [testPlanReports, setTestPlanReports] = useState([]);
    const [latestTestPlanVersions, setLatestTestPlanVersions] = useState([]);
    const [structuredTestPlanTargets, setStructuredTestPlanTargets] = useState(
        {}
    );
    const [
        deleteTestPlanReportDetails,
        setDeleteTestPlanReportDetails
    ] = useState({});
    const [
        isShowingDeleteTestPlanReportModal,
        setDeleteTestPlanReportModal
    ] = useState(false);
    const [deleteResultsDetails, setDeleteResultsDetails] = useState({});
    const [isShowingDeleteResultsModal, setDeleteResultsModal] = useState(
        false
    );
    const [isShowingAddToQueueModal, setAddToQueueModal] = useState(false);

    const auth = evaluateAuth(data && data.me ? data.me : {});
    const { id, isAdmin } = auth;
    const isSignedIn = !!id;

    useEffect(() => {
        if (!isShowingAddToQueueModal) {
            const trigger = document.querySelector(
                `#${ADD_TEST_PLAN_DIALOG_TRIGGER_ID}`
            );

            trigger && trigger.focus();
        }
    }, [isShowingAddToQueueModal]);

    useEffect(() => {
        if (data) {
            const { users = [], testPlanReports = [], testPlans = [] } = data;
            setTesters(
                users.filter(
                    tester =>
                        tester.roles.includes('TESTER') ||
                        tester.roles.includes('ADMIN')
                )
            );
            setTestPlanReports(testPlanReports);
            setLatestTestPlanVersions(testPlans);
        }
    }, [data]);

    useEffect(() => {
        const structuredTestPlanTargets = generateStructuredTestPlanVersions(
            testPlanReports
        );
        setStructuredTestPlanTargets(structuredTestPlanTargets);
    }, [testPlanReports]);

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
        if (!testPlanReports.length) return null;

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
                        {testPlanReports.map(testPlanReport => {
                            const key = `test_plan_report_${testPlanReport.id}`;
                            return (
                                <TestQueueRow
                                    key={key}
                                    user={auth}
                                    testers={testers}
                                    testPlanReport={testPlanReport}
                                    latestTestPlanVersions={
                                        latestTestPlanVersions
                                    }
                                    triggerDeleteTestPlanReportModal={
                                        triggerDeleteTestPlanReportModal
                                    }
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
        if (deleteTestPlanReportDetails.deleteFunction)
            await deleteTestPlanReportDetails.deleteFunction();
        handleCloseDeleteTestPlanReportModal();
    };

    const handleCloseDeleteTestPlanReportModal = () => {
        setDeleteTestPlanReportModal(false);

        // reset deleteTestPlanDetails
        setDeleteTestPlanReportDetails({});
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
        setDeleteResultsModal(true);
    };

    const handleDeleteResults = async () => {
        if (deleteResultsDetails.deleteFunction)
            await deleteResultsDetails.deleteFunction();
        handleCloseDeleteResultsModal();
    };

    const handleCloseDeleteResultsModal = () => {
        setDeleteResultsModal(false);

        // reset deleteResultsDetails
        setDeleteResultsDetails({});
    };

    const handleCloseAddTestPlanToQueueModal = () => setAddToQueueModal(false);

    if (loading) {
        return (
            <PageStatus
                title="Loading - Test Queue | ARIA-AT"
                heading="Test Queue"
            />
        );
    }

    if (!testPlanReports.length) {
        const noTestPlansMessage = 'There are no test plans available';
        const settingsLink = <Link to="/account/settings">Settings</Link>;

        return (
            <Container id="main" as="main" tabIndex="-1">
                <Helmet>
                    <title>{noTestPlansMessage} | ARIA-AT</title>
                </Helmet>
                <h2 data-testid="test-queue-no-test-plans-h2">
                    {noTestPlansMessage}
                </h2>
                {!isAdmin && isSignedIn && (
                    <Alert
                        key="alert-configure"
                        variant="danger"
                        data-testid="test-queue-no-test-plans-p"
                    >
                        Please configure your preferred Assistive Technologies
                        in the {settingsLink} page.
                    </Alert>
                )}
                {isAdmin && (
                    <Alert
                        key="alert-configure"
                        variant="danger"
                        data-testid="test-queue-no-test-plans-p"
                    >
                        Add a Test Plan to the Queue
                    </Alert>
                )}

                {isAdmin && (
                    <NewTestPlanReportContainer
                        handleOpenDialog={() => setAddToQueueModal(true)}
                        openDialogTriggerId={ADD_TEST_PLAN_DIALOG_TRIGGER_ID}
                    />
                )}

                {isAdmin && isShowingAddToQueueModal && (
                    <NewTestPlanReportModal
                        show={isShowingAddToQueueModal}
                        handleClose={handleCloseAddTestPlanToQueueModal}
                        handleAddToTestQueue={refetch}
                    />
                )}
            </Container>
        );
    }

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>{`Test Queue | ARIA-AT`}</title>
            </Helmet>
            <h1>Test Queue</h1>
            <p data-testid="test-queue-instructions">
                {isSignedIn
                    ? 'Assign yourself a test plan or start executing one that is already assigned to you.'
                    : 'Select a test plan to view. Your results will not be saved.'}
            </p>

            {isAdmin && (
                <NewTestPlanReportContainer
                    handleOpenDialog={() => setAddToQueueModal(true)}
                />
            )}

            {Object.keys(structuredTestPlanTargets).map(key =>
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

            {isAdmin && isShowingAddToQueueModal && (
                <NewTestPlanReportModal
                    show={isShowingAddToQueueModal}
                    handleClose={handleCloseAddTestPlanToQueueModal}
                    handleAddToTestQueue={refetch}
                />
            )}
        </Container>
    );
};

export default TestQueue;
