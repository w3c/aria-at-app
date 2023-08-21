import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Table, Alert } from 'react-bootstrap';
import { useQuery } from '@apollo/client';
import { DATA_MANAGEMENT_PAGE_QUERY } from './queries';
import PageStatus from '../common/PageStatus';
import ManageTestQueue from '../ManageTestQueue';
import DataManagementRow from '@components/DataManagement/DataManagementRow';
import './DataManagement.css';
import { evaluateAuth } from '@client/utils/evaluateAuth';

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

    const auth = evaluateAuth(data && data.me ? data.me : {});
    const { isAdmin } = auth;

    useEffect(() => {
        if (data) {
            const {
                ats = [],
                browsers = [],
                testPlanVersions = [],
                testPlans = []
            } = data;
            setAts(ats);
            setBrowsers(browsers);
            setTestPlans(testPlans);
            setTestPlanVersions(testPlanVersions);
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

            {emptyTestPlans && isAdmin && (
                <Alert
                    key="alert-configure"
                    variant="danger"
                    data-testid="data-management-no-test-plans-p"
                >
                    Add a Test Plan to the Queue
                </Alert>
            )}

            {isAdmin ? (
                <>
                    <h2>Introduction</h2>
                    <p data-testid="data-management-instructions">
                        This page provides a view of the latest test plan
                        version information, and where they currently are in the{' '}
                        <a href="https://github.com/w3c/aria-at/wiki/Working-Mode">
                            ARIA-AT Community Group’s review process
                        </a>
                        .<br />
                        Use this page to manage Test Plans in the Test Queue and
                        their phases.
                    </p>

                    <ManageTestQueue
                        ats={ats}
                        browsers={browsers}
                        testPlanVersions={testPlanVersions}
                        triggerUpdate={refetch}
                    />
                </>
            ) : (
                <>
                    <h2>Introduction</h2>
                    <p data-testid="data-management-instructions">
                        This page provides a view of the latest test plan
                        version information, and where they currently are in the{' '}
                        <a href="https://github.com/w3c/aria-at/wiki/Working-Mode">
                            ARIA-AT Community Group’s review process
                        </a>
                        .
                    </p>
                </>
            )}

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
                        .sort((a, b) => {
                            // First sort by overall status descending: recommended plans,
                            // then candidate plans, then draft plans, then R&D complete plans.
                            const phaseOrder = {
                                RD: 0,
                                DRAFT: 1,
                                CANDIDATE: 2,
                                RECOMMENDED: 3
                            };

                            const getTestPlanVersionOverallPhase = t => {
                                let testPlanVersionOverallPhase = 'RD';

                                Object.keys(phaseOrder).forEach(phaseKey => {
                                    testPlanVersionOverallPhase =
                                        testPlanVersions.filter(
                                            ({ phase, testPlan }) =>
                                                testPlan.directory ===
                                                    t.directory &&
                                                phase === phaseKey
                                        ).length
                                            ? phaseKey
                                            : testPlanVersionOverallPhase;
                                });
                                return testPlanVersionOverallPhase;
                            };

                            const testPlanVersionOverallA =
                                getTestPlanVersionOverallPhase(a);
                            const testPlanVersionOverallB =
                                getTestPlanVersionOverallPhase(b);

                            const phaseA = phaseOrder[testPlanVersionOverallA];
                            const phaseB = phaseOrder[testPlanVersionOverallB];

                            if (phaseA > phaseB) return -1;
                            if (phaseA < phaseB) return 1;

                            // Then sort by test plan name ascending.
                            if (a.title < b.title) return -1;
                            if (a.title > b.title) return 1;

                            return 0;
                        })
                        .map(testPlan => {
                            return (
                                <DataManagementRow
                                    key={testPlan.id}
                                    isAdmin={isAdmin}
                                    ats={ats}
                                    testPlan={testPlan}
                                    testPlanVersions={testPlanVersions.filter(
                                        testPlanVersion =>
                                            testPlanVersion.testPlan
                                                .directory ===
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
