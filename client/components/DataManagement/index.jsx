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
import SortableTableHeader from '../common/SortableTableHeader';
import {
    DATA_MANAGEMENT_TABLE_FILTER_OPTIONS,
    DATA_MANAGEMENT_TABLE_SORT_OPTIONS
} from '../../utils/constants';
import FilterButtons from '../common/FilterButtons';
import {
    useDataManagementTableFiltering,
    useDataManagementTableSorting
} from './hooks';

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

    const { filteredTestPlans, filterLabels } = useDataManagementTableFiltering(
        testPlans,
        testPlanVersions,
        filter
    );

    const { sortedTestPlans, updateSort, activeSort } =
        useDataManagementTableSorting(filteredTestPlans, testPlanVersions, ats);

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
                                activeSort.key ===
                                DATA_MANAGEMENT_TABLE_SORT_OPTIONS.NAME
                            }
                            onSort={direction =>
                                updateSort({
                                    key: DATA_MANAGEMENT_TABLE_SORT_OPTIONS.NAME,
                                    direction
                                })
                            }
                        />
                        <SortableTableHeader
                            title="Covered AT"
                            active={
                                activeSort.key ===
                                DATA_MANAGEMENT_TABLE_SORT_OPTIONS.ATS
                            }
                            onSort={direction =>
                                updateSort({
                                    key: DATA_MANAGEMENT_TABLE_SORT_OPTIONS.ATS,
                                    direction
                                })
                            }
                        />
                        <SortableTableHeader
                            title="Overall Status"
                            active={
                                activeSort.key ===
                                DATA_MANAGEMENT_TABLE_SORT_OPTIONS.PHASE
                            }
                            onSort={direction =>
                                updateSort({
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
