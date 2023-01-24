import React from 'react';
import { useQuery } from '@apollo/client';
import { Route, Switch } from 'react-router';
import { Redirect, useRouteMatch } from 'react-router-dom';
import SummarizeTestPlanVersion from './SummarizeTestPlanVersion';
import SummarizeTestPlanReport from './SummarizeTestPlanReport';
import PageStatus from '../common/PageStatus';
import { REPORT_PAGE_QUERY } from './queries';
import './Reports.css';

const Reports = () => {
    const match = useRouteMatch('/report/:testPlanVersionId');

    const { loading, data, error } = useQuery(REPORT_PAGE_QUERY, {
        variables: { testPlanVersionId: match?.params?.testPlanVersionId },
        fetchPolicy: 'cache-and-network'
    });

    if (error) {
        return (
            <PageStatus
                title="Test Reports | ARIA-AT"
                heading="Test Reports"
                message={error.message}
                isError
            />
        );
    }

    if (loading) {
        return (
            <PageStatus
                title="Loading - Test Reports | ARIA-AT"
                heading="Test Reports"
            />
        );
    }

    if (!data) return null;

    return (
        <Switch>
            <Route
                exact
                path="/report/:testPlanVersionId"
                render={({ match: { params } }) => {
                    const { testPlanVersionId } = params;

                    const testPlanReports = data.testPlanReports.filter(
                        each => each.testPlanVersion.id === testPlanVersionId
                    );

                    if (!testPlanReports.length) return <Redirect to="/404" />;

                    return (
                        <SummarizeTestPlanVersion
                            testPlanVersion={testPlanReports[0].testPlanVersion}
                            testPlanReports={testPlanReports}
                        />
                    );
                }}
            />
            <Route
                exact
                path="/report/:testPlanVersionId/targets/:testPlanReportId"
                render={({ match: { params } }) => {
                    const { testPlanVersionId, testPlanReportId } = params;

                    const testPlanReport = data.testPlanReports.find(
                        each =>
                            each.testPlanVersion.id === testPlanVersionId &&
                            each.id == testPlanReportId
                    );

                    if (!testPlanReport) return <Redirect to="/404" />;

                    return (
                        <SummarizeTestPlanReport
                            testPlanReport={testPlanReport}
                        />
                    );
                }}
            />
            <Redirect to="/404" />
        </Switch>
    );
};

export default Reports;
