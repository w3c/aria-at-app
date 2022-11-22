import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Table, Alert } from 'react-bootstrap';
import { useQuery } from '@apollo/client';
import { TEST_MANAGEMENT_PAGE_QUERY } from './queries';
import StatusSummaryRow from './StatusSummaryRow';
import PageStatus from '../common/PageStatus';
import DisclosureComponent from '../common/DisclosureComponent';
import ManageTestQueue from '../ManageTestQueue';
import './TestManagement.css';

const TestManagement = () => {
    const { loading, data, error, refetch } = useQuery(
        TEST_MANAGEMENT_PAGE_QUERY,
        {
            fetchPolicy: 'cache-and-network'
        }
    );

    const [pageReady, setPageReady] = useState(false);
    const [ats, setAts] = useState([]);
    const [browsers, setBrowsers] = useState([]);
    const [testPlanVersions, setTestPlanVersions] = useState([]);
    const [testPlanReports, setTestPlanReports] = useState([]);

    const [
        summaryGroupedTestPlanReports,
        setSummaryGroupedTestPlanReports
    ] = useState({});

    useEffect(() => {
        if (data) {
            const {
                ats = [],
                browsers = [],
                testPlanVersions = [],
                testPlanReports = []
            } = data;
            setAts(ats);
            setTestPlanVersions(testPlanVersions);
            setTestPlanReports(testPlanReports);
            setBrowsers(browsers);
            setPageReady(true);
        }
    }, [data]);

    useEffect(() => {
        const jawsGroup = testPlanReports.filter(t => t.at.id == 1);
        const nvdaGroup = testPlanReports.filter(t => t.at.id == 2);
        const voGroup = testPlanReports.filter(t => t.at.id == 3);

        const groupedData = atGroup => {
            let allResultGroup = {};
            let summaryResultGroup = {};

            atGroup.forEach(t => {
                const testPlanId = t.testPlanVersion.testPlan.directory;
                if (!allResultGroup[testPlanId])
                    allResultGroup[testPlanId] = [t];
                else allResultGroup[testPlanId].push(t);

                // Ensure the latest version is being used in the grouped data
                // In the future, it can be assumed that the latest can be
                // consistently retrieved from
                // `query { testPlans { latestTestPlanVersion } }`
                if (!summaryResultGroup[testPlanId])
                    summaryResultGroup[testPlanId] = t;
                else if (
                    new Date(t.testPlanVersion.updatedAt) >
                    new Date(
                        summaryResultGroup[testPlanId].testPlanVersion.updatedAt
                    )
                ) {
                    summaryResultGroup[testPlanId] = t;
                }
            });

            return { allResultGroup, summaryResultGroup };
        };

        const {
            allResultGroup: allJawsGroupedByTestPlan,
            summaryResultGroup: summaryJawsGroupedByTestPlan
        } = groupedData(jawsGroup);
        const {
            allResultGroup: allNvdaGroupedByTestPlan,
            summaryResultGroup: summaryNvdaGroupedByTestPlan
        } = groupedData(nvdaGroup);
        const {
            allResultGroup: allVoGroupedByTestPlan,
            summaryResultGroup: summaryVoGroupedByTestPlan
        } = groupedData(voGroup);

        // TODO: This dataset can be used in the future to complete the AT
        //       separated sections
        // eslint-disable-next-line
        const allGroupedTestPlanReports = {
            jaws: allJawsGroupedByTestPlan,
            nvda: allNvdaGroupedByTestPlan,
            vo: allVoGroupedByTestPlan
        };

        const summaryGroupedTestPlanReports = {
            jaws: summaryJawsGroupedByTestPlan,
            nvda: summaryNvdaGroupedByTestPlan,
            vo: summaryVoGroupedByTestPlan
        };

        setSummaryGroupedTestPlanReports(summaryGroupedTestPlanReports);
    }, [testPlanReports]);

    if (error) {
        return (
            <PageStatus
                title="Test Management | ARIA-AT"
                heading="Test Management"
                message={error.message}
                isError
            />
        );
    }

    if (loading || !pageReady) {
        return (
            <PageStatus
                title="Loading - Test Management | ARIA-AT"
                heading="Test Management"
            />
        );
    }

    const constructStatusSummaryData = () => {
        let result = {};

        // Arrange the summary data by example
        Object.keys(summaryGroupedTestPlanReports).forEach(atKey => {
            Object.keys(summaryGroupedTestPlanReports[atKey]).forEach(
                exampleKey => {
                    if (!result[exampleKey]) result[exampleKey] = {};
                    result[exampleKey][atKey] =
                        summaryGroupedTestPlanReports[atKey][exampleKey];
                }
            );
        });

        return result;
    };

    const emptyTestPlans = !testPlanReports.length;
    const summaryData = constructStatusSummaryData();

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>Test Management | ARIA-AT</title>
            </Helmet>
            <h1>Test Management</h1>

            {emptyTestPlans && (
                <h2 data-testid="test-management-no-test-plans-h2">
                    There are no test plans available
                </h2>
            )}

            {emptyTestPlans && (
                <Alert
                    key="alert-configure"
                    variant="danger"
                    data-testid="test-management-no-test-plans-p"
                >
                    Add a Test Plan to the Queue
                </Alert>
            )}

            <p data-testid="test-management-instructions">
                Manage test plans in the Test Queue and test plan phases.
            </p>

            <ManageTestQueue
                ats={ats}
                browsers={browsers}
                testPlanVersions={testPlanVersions}
                triggerUpdate={refetch}
            />

            <br />
            <br />
            <DisclosureComponent
                componentId="test-management"
                title="Status Summary"
                expanded
                disclosureContainerView={
                    <>
                        <Table
                            className="test-management"
                            aria-label="Status Summary Table"
                            striped
                            bordered
                            hover
                        >
                            <thead>
                                <tr>
                                    <th>Test Plans</th>
                                    <th className="phase">Phase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Sort the summary items by title */}
                                {Object.keys(summaryData)
                                    .sort((a, b) =>
                                        Object.values(summaryData[a])[0]
                                            .testPlanVersion.title <
                                        Object.values(summaryData[b])[0]
                                            .testPlanVersion.title
                                            ? -1
                                            : 1
                                    )
                                    .map(k => {
                                        const summaryItem = summaryData[k];
                                        const atItems = Object.values(
                                            summaryItem
                                        );
                                        const key = `summary-table-item-${k}`;
                                        return (
                                            <StatusSummaryRow
                                                key={key}
                                                atItems={atItems}
                                            />
                                        );
                                    })}
                            </tbody>
                        </Table>
                    </>
                }
            />
        </Container>
    );
};

export default TestManagement;
