import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Table, Alert } from 'react-bootstrap';
import { useQuery } from '@apollo/client';
import { DATA_MANAGEMENT_PAGE_QUERY } from './queries';
import PageStatus from '../common/PageStatus';
import ManageTestQueue from '../ManageTestQueue';
import DataManagementRow from '@components/DataManagement/DataManagementRow';
import './DataManagement.css';
import { evaluateAuth } from '@client/utils/evaluateAuth';
import SortableTableHeader, {
    TABLE_SORT_ORDERS
} from '../common/SortableTableHeader';

const DataManagement = () => {
    const { loading, data, error, refetch } = useQuery(
        DATA_MANAGEMENT_PAGE_QUERY,
        { fetchPolicy: 'cache-and-network' }
    );

    const [pageReady, setPageReady] = useState(false);
    const [ats, setAts] = useState([]);
    const [browsers, setBrowsers] = useState([]);
    const [testPlans, setTestPlans] = useState([]);
    const [testPlanVersions, setTestPlanVersions] = useState([]);
    const [sort, setSort] = useState({
        key: 'phase',
        direction: TABLE_SORT_ORDERS.ASC
    });

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

    const sortedTestPlans = useMemo(() => {
        const phaseOrder = {
            RD: 0,
            DRAFT: 1,
            CANDIDATE: 2,
            RECOMMENDED: 3
        };
        const directionMod = sort.direction === TABLE_SORT_ORDERS.ASC ? -1 : 1;

        const getTestPlanVersionOverallPhase = t => {
            return (
                Object.keys(phaseOrder).find(phaseKey =>
                    testPlanVersions.some(
                        ({ phase, testPlan }) =>
                            testPlan.directory === t.directory &&
                            phase === phaseKey
                    )
                ) || 'RD'
            );
        };

        const getUniqueAtObjectsCount = testPlanVersion => {
            const uniqueAtIds = new Set(
                testPlanVersion.flatMap(tpv =>
                    tpv.testPlanReports.map(tpr => tpr.at.id)
                )
            );
            return uniqueAtIds.size;
        };

        const sortByName = (a, b) =>
            directionMod * (a.title < b.title ? -1 : 1);

        const sortByAts = (a, b) => {
            const countA = getUniqueAtObjectsCount(
                testPlanVersions.filter(
                    tpv => tpv.testPlan.directory === a.directory
                )
            );
            const countB = getUniqueAtObjectsCount(
                testPlanVersions.filter(
                    tpv => tpv.testPlan.directory === b.directory
                )
            );
            if (countA === countB) return sortByName(a, b);
            return directionMod * (countA - countB);
        };

        const sortByPhase = (a, b) => {
            const testPlanVersionOverallA = getTestPlanVersionOverallPhase(a);
            const testPlanVersionOverallB = getTestPlanVersionOverallPhase(b);
            if (testPlanVersionOverallA === testPlanVersionOverallB)
                return sortByName(a, b);
            return (
                directionMod *
                (phaseOrder[testPlanVersionOverallA] -
                    phaseOrder[testPlanVersionOverallB])
            );
        };

        return testPlans.slice().sort((a, b) => {
            switch (sort.key) {
                case 'ats':
                    return sortByAts(a, b);
                case 'phase':
                    return sortByPhase(a, b);
                case 'name':
                    return sortByName(a, b);
                default:
                    return 0;
            }
        });
    }, [sort, testPlans]);

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
                        <SortableTableHeader
                            title="Test Plan"
                            onSort={direction =>
                                setSort({ key: 'name', direction })
                            }
                        />
                        <SortableTableHeader
                            title="Covered AT"
                            onSort={direction =>
                                setSort({ key: 'ats', direction })
                            }
                        />
                        <SortableTableHeader
                            title="Overall Status"
                            onSort={direction =>
                                setSort({ key: 'phase', direction })
                            }
                        />
                        <th>R&D Version</th>
                        <th>Draft Review</th>
                        <th>Candidate Review</th>
                        <th>Recommended Version</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTestPlans.map(testPlan => {
                        return (
                            <DataManagementRow
                                key={testPlan.id}
                                isAdmin={isAdmin}
                                ats={ats}
                                testPlan={testPlan}
                                testPlanVersions={testPlanVersions.filter(
                                    testPlanVersion =>
                                        testPlanVersion.testPlan.directory ===
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
