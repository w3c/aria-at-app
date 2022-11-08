import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Table, Alert } from 'react-bootstrap';
import { useQuery } from '@apollo/client';
import { TEST_MANAGEMENT_PAGE_QUERY } from './queries';
import PageStatus from '../common/PageStatus';
import ManageTestQueue from '../ManageTestQueue';

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
    // const [latestTestPlanVersions, setLatestTestPlanVersions] = useState([]);

    useEffect(() => {
        if (data) {
            const {
                users = [],
                ats = [],
                browsers = [],
                testPlanVersions = [],
                testPlanReports = [],
                testPlans = []
            } = data;
            setAts(ats);
            setTestPlanVersions(testPlanVersions);
            setTestPlanReports(testPlanReports);
            setBrowsers(browsers);
            // setLatestTestPlanVersions(testPlans);
            setPageReady(true);
        }
    }, [data]);

    useEffect(() => {
        const jawsGroup = testPlanReports.filter(t => t.at.id == 1);
        const nvdaGroup = testPlanReports.filter(t => t.at.id == 2);
        const voGroup = testPlanReports.filter(t => t.at.id == 3);

        let allJawsGroupedByTestPlan = {};
        let summaryJawsGroupedByTestPlan = {};
        jawsGroup.forEach(t => {
            const testPlanId = t.testPlanVersion.testPlan.directory;
            if (!allJawsGroupedByTestPlan[testPlanId])
                allJawsGroupedByTestPlan[testPlanId] = [t];
            else allJawsGroupedByTestPlan[testPlanId].push(t);

            if (!summaryJawsGroupedByTestPlan[testPlanId])
                summaryJawsGroupedByTestPlan[testPlanId] = t;
            else if (
                new Date(t.testPlanVersion.updatedAt) >
                new Date(
                    summaryJawsGroupedByTestPlan[
                        testPlanId
                    ].testPlanVersion.updatedAt
                )
            ) {
                summaryJawsGroupedByTestPlan[testPlanId] = t;
            }
        });

        let allNvdaGroupedByTestPlan = {};
        let summaryNvdaGroupedByTestPlan = {};
        nvdaGroup.forEach(t => {
            const testPlanId = t.testPlanVersion.testPlan.directory;
            if (!allNvdaGroupedByTestPlan[testPlanId])
                allNvdaGroupedByTestPlan[testPlanId] = [t];
            else allNvdaGroupedByTestPlan[testPlanId].push(t);

            if (!summaryNvdaGroupedByTestPlan[testPlanId])
                summaryNvdaGroupedByTestPlan[testPlanId] = t;
            else if (
                new Date(t.testPlanVersion.updatedAt) >
                new Date(
                    summaryNvdaGroupedByTestPlan[
                        testPlanId
                    ].testPlanVersion.updatedAt
                )
            ) {
                summaryNvdaGroupedByTestPlan[testPlanId] = t;
            }
        });

        let allVoGroupedByTestPlan = {};
        let summaryVoGroupedByTestPlan = {};
        voGroup.forEach(t => {
            const testPlanId = t.testPlanVersion.testPlan.directory;
            if (!allVoGroupedByTestPlan[testPlanId])
                allVoGroupedByTestPlan[testPlanId] = [t];
            else allVoGroupedByTestPlan[testPlanId].push(t);

            if (!summaryVoGroupedByTestPlan[testPlanId])
                summaryVoGroupedByTestPlan[testPlanId] = t;
            else if (
                new Date(t.testPlanVersion.updatedAt) >
                new Date(
                    summaryVoGroupedByTestPlan[
                        testPlanId
                    ].testPlanVersion.updatedAt
                )
            ) {
                summaryVoGroupedByTestPlan[testPlanId] = t;
            }
        });

        let allGroupedTestPlanReports = {
            jaws: allJawsGroupedByTestPlan,
            nvda: allNvdaGroupedByTestPlan,
            vo: allVoGroupedByTestPlan
        };

        let summaryGroupedTestPlanReports = {
            jaws: summaryJawsGroupedByTestPlan,
            nvda: summaryNvdaGroupedByTestPlan,
            vo: summaryVoGroupedByTestPlan
        };

        console.log('allGroupedByAt', allGroupedTestPlanReports);
        console.log('summaryGroupedByAt', summaryGroupedTestPlanReports);
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

    const emptyTestPlans = !testPlanReports.length;
    const noTestPlansMessage = 'There are no test plans available';

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>{`${
                    emptyTestPlans ? noTestPlansMessage : 'Test Management'
                } | ARIA-AT`}</title>
            </Helmet>
            <h1>Test Management</h1>

            {emptyTestPlans && (
                <h2 data-testid="test-management-no-test-plans-h2">
                    {noTestPlansMessage}
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
                TODO: This text needs to be updated.
            </p>

            <ManageTestQueue
                ats={ats}
                browsers={browsers}
                testPlanVersions={testPlanVersions}
                triggerUpdate={refetch}
            />
        </Container>
    );
};

export default TestManagement;
