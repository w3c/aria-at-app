import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Table, Alert } from 'react-bootstrap';
import { useQuery } from '@apollo/client';
import { DATA_MANAGEMENT_PAGE_QUERY } from './queries';
import PageStatus from '../common/PageStatus';
import ManageTestQueue from '../ManageTestQueue';
import DataManagementRow from '@components/DataManagement/DataManagementRow';
import './DataManagement.css';

const DataManagement = () => {
    const { loading, data, error, refetch } = useQuery(
        DATA_MANAGEMENT_PAGE_QUERY,
        {
            fetchPolicy: 'cache-and-network'
        }
    );

    const [pageReady, setPageReady] = useState(false);
    const [ats, setAts] = useState([]);
    const [browsers, setBrowsers] = useState([]);
    const [testPlans, setTestPlans] = useState([]);
    const [testPlanVersions, setTestPlanVersions] = useState([]);
    const [testPlanReports, setTestPlanReports] = useState([]);

    useEffect(() => {
        if (data) {
            const {
                ats = [],
                browsers = [],
                testPlanVersions = [],
                testPlanReports = [],
                testPlans = []
            } = data;
            setAts(ats);
            setBrowsers(browsers);
            setTestPlans(testPlans);
            setTestPlanVersions(testPlanVersions);
            setTestPlanReports(testPlanReports);
            setPageReady(true);
        }
    }, [data]);

    if (error) {
        return (
            <PageStatus
                title="Data Management | ARIA-AT"
                heading="Data Management"
                message={error.message}
                isError
            />
        );
    }

    if (loading || !pageReady) {
        return (
            <PageStatus
                title="Loading - Data Management | ARIA-AT"
                heading="Data Management"
            />
        );
    }

    const emptyTestPlans = !testPlans.length;

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>Data Management | ARIA-AT</title>
            </Helmet>
            <h1>Data Management</h1>

            {emptyTestPlans && (
                <h2 data-testid="data-management-no-test-plans-h2">
                    There are no Test Plans available
                </h2>
            )}

            {emptyTestPlans && (
                <Alert
                    key="alert-configure"
                    variant="danger"
                    data-testid="data-management-no-test-plans-p"
                >
                    Add a Test Plan to the Queue
                </Alert>
            )}

            <p data-testid="data-management-instructions">
                Manage Test Plans in the Test Queue and their phases.
            </p>

            <ManageTestQueue
                ats={ats}
                browsers={browsers}
                testPlanVersions={testPlanVersions}
                triggerUpdate={refetch}
            />

            <h2>Test Plans Status Summary</h2>
            <Table
                className="data-management"
                aria-label="Test Plans Status Summary Table"
                bordered
                hover
            >
                <thead>
                    <tr>
                        <th>Test Plan</th>
                        <th>Covered AT</th>
                        <th>Overall Status</th>
                        <th>R&D Version</th>
                        <th>Draft Review</th>
                        <th>Candidate Review</th>
                        <th>Recommended Version</th>
                    </tr>
                </thead>
                <tbody>
                    {testPlans
                        .slice()
                        .sort((a, b) => (a.title < b.title ? -1 : 1))
                        .map(testPlan => {
                            return (
                                <DataManagementRow
                                    key={testPlan.id}
                                    testPlan={testPlan}
                                    testPlanVersions={testPlanVersions.filter(
                                        testPlanVersion =>
                                            testPlanVersion.testPlan
                                                .directory ===
                                            testPlan.directory
                                    )}
                                    testPlanReports={testPlanReports.filter(
                                        testPlanReport =>
                                            testPlanReport.testPlanVersion
                                                .testPlan.directory ===
                                            testPlan.directory
                                    )}
                                    setTestPlanVersions={setTestPlanVersions}
                                />
                            );
                        })}
                </tbody>
            </Table>
        </Container>
    );
};

export default DataManagement;
