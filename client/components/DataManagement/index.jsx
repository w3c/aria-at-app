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
import {
    DATA_MANAGEMENT_TABLE_FILTER_OPTIONS,
    DATA_MANAGEMENT_TABLE_SORT_OPTIONS,
    TABLE_SORT_ORDERS
} from '../../utils/constants';
import FilterButtons from '../common/FilterButtons';

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
        key: DATA_MANAGEMENT_TABLE_SORT_OPTIONS.PHASE,
        direction: TABLE_SORT_ORDERS.ASC
    });
    const [filter, setFilter] = useState(
        DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL
    );

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

    const filteredTestPlans = useMemo(() => {
        switch (filter) {
            case DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RD:
                return rdTestPlans;
            case DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.DRAFT:
                return draftTestPlans;
            case DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.CANDIDATE:
                return candidateTestPlans;
            case DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RECOMMENDED:
                return recommendedTestPlans;
            case DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL:
            default:
                return testPlans;
        }
    }, [filter, testPlans]);

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

        const sortByName = (a, b, dir = directionMod) =>
            dir * (a.title < b.title ? -1 : 1);

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
                return sortByName(a, b, 1);
            return (
                directionMod *
                (phaseOrder[testPlanVersionOverallA] -
                    phaseOrder[testPlanVersionOverallB])
            );
        };

        const sortFunctions = {
            NAME: sortByName,
            ATS: sortByAts,
            PHASE: sortByPhase
        };

        return filteredTestPlans.slice().sort(sortFunctions[sort.key]);
    }, [sort, filteredTestPlans]);

    const filterLabels = {
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RD]: `R&D Complete (${rdTestPlans.length})`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.DRAFT]: `In Draft Review (${draftTestPlans.length})`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.CANDIDATE]: `In Candidate Review (${candidateTestPlans.length})`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RECOMMENDED]: `Recommended Plans (${recommendedTestPlans.length})`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL]: `All Plans (${testPlans.length})`
    };

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
            <FilterButtons
                filterOptions={DATA_MANAGEMENT_TABLE_FILTER_OPTIONS}
                optionLabels={filterLabels}
                activeFilter={filter}
                onFilterChange={setFilter}
            />
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
                            active={
                                sort.key ===
                                DATA_MANAGEMENT_TABLE_SORT_OPTIONS.NAME
                            }
                            onSort={direction =>
                                setSort({
                                    key: DATA_MANAGEMENT_TABLE_SORT_OPTIONS.NAME,
                                    direction
                                })
                            }
                        />
                        <SortableTableHeader
                            title="Covered AT"
                            active={
                                sort.key ===
                                DATA_MANAGEMENT_TABLE_SORT_OPTIONS.ATS
                            }
                            onSort={direction =>
                                setSort({
                                    key: DATA_MANAGEMENT_TABLE_SORT_OPTIONS.ATS,
                                    direction
                                })
                            }
                        />
                        <SortableTableHeader
                            title="Overall Status"
                            active={
                                sort.key ===
                                DATA_MANAGEMENT_TABLE_SORT_OPTIONS.PHASE
                            }
                            onSort={direction =>
                                setSort({
                                    key: DATA_MANAGEMENT_TABLE_SORT_OPTIONS.PHASE,
                                    direction
                                })
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
