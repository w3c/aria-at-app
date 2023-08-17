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
import SortableTableHeader from '../common/SortableTableHeader';
import { TABLE_SORT_ORDERS } from '../../utils/enums';
import FilterButtons from '../common/FilterButtons';
import FilterButton from '../common/FilterButtons/FilterButton';

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
    const [sort, setSort] = useState({
        key: 'phase',
        direction: TABLE_SORT_ORDERS.ASC
    });

    const [filteredTestPlans, setFilteredTestPlans] = useState(testPlans);

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

    useEffect(() => {
        setFilteredTestPlans(testPlans);
    }, [testPlans]);

    const [
        rdTestPlans,
        draftTestPlans,
        candidateTestPlans,
        recommendedTestPlans
    ] = useMemo(() => {
        return testPlans.reduce(
            (acc, testPlan) => {
                const testPlanVersion = testPlanVersions.find(
                    ({ testPlan: { directory } }) =>
                        directory === testPlan.directory
                );
                if (!testPlanVersion) return acc;
                const phase = testPlanVersion.phase;
                switch (phase) {
                    case 'RD':
                        acc[0].push(testPlan);
                        break;
                    case 'DRAFT':
                        acc[1].push(testPlan);
                        break;
                    case 'CANDIDATE':
                        acc[2].push(testPlan);
                        break;
                    case 'RECOMMENDED':
                        acc[3].push(testPlan);
                        break;
                    default:
                        break;
                }
                return acc;
            },
            [[], [], [], []]
        );
    }, [testPlans]);

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

        const sortByName = (a, b) =>
            directionMod * (a.title < b.title ? -1 : 1);

        const sortByAts = (a, b) => {
            const countA = ats.length; // Stubs based on current rendering in DataManagementRow
            const countB = ats.length;
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

        return filteredTestPlans.slice().sort((a, b) => {
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
    }, [sort, filteredTestPlans]);

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
                    <p data-testid="data-management-instructions">
                        Manage Test Plans in the Test Queue and their phases.
                    </p>

                    <ManageTestQueue
                        ats={ats}
                        browsers={browsers}
                        testPlanVersions={testPlanVersions}
                        triggerUpdate={refetch}
                    />
                </>
            ) : (
                <p data-testid="data-management-instructions">
                    View Test Plans in the Test Queue and their phases.
                </p>
            )}

            <h2>Test Plans Status Summary</h2>
            <FilterButtons onFilterChange={f => f()}>
                <FilterButton
                    filterFunction={() => setFilteredTestPlans(testPlans)}
                >
                    All Plans ({testPlans.length})
                </FilterButton>
                <FilterButton
                    filterFunction={() => setFilteredTestPlans(rdTestPlans)}
                >
                    R & D Complete ({rdTestPlans.length})
                </FilterButton>
                <FilterButton
                    filterFunction={() => setFilteredTestPlans(draftTestPlans)}
                >
                    In Draft Review ({draftTestPlans.length})
                </FilterButton>
                <FilterButton
                    filterFunction={() =>
                        setFilteredTestPlans(candidateTestPlans)
                    }
                >
                    In Candidate Review ({candidateTestPlans.length})
                </FilterButton>
                <FilterButton
                    filterFunction={() =>
                        setFilteredTestPlans(recommendedTestPlans)
                    }
                >
                    Recommended Plans ({recommendedTestPlans.length})
                </FilterButton>
            </FilterButtons>
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
                            active={sort.key === 'name'}
                            onSort={direction =>
                                setSort({ key: 'name', direction })
                            }
                        />
                        <SortableTableHeader
                            title="Covered AT"
                            active={sort.key === 'ats'}
                            onSort={direction =>
                                setSort({ key: 'ats', direction })
                            }
                        />
                        <SortableTableHeader
                            title="Overall Status"
                            active={sort.key === 'phase'}
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
