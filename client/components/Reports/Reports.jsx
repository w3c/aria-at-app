import React from 'react';
import { useQuery } from '@apollo/client';
import { REPORTS_PAGE_QUERY } from './queries';
import SummarizeTestPlanReports from './SummarizeTestPlanReports';
import SummarizeTestPlanVersion from './SummarizeTestPlanVersion';
import SummarizeTestPlanReport from './SummarizeTestPlanReport';
import { Redirect, Route, Switch } from 'react-router';
import './Reports.css';

const Reports = () => {
    const { data } = useQuery(REPORTS_PAGE_QUERY);
    if (!data) return null;

    return (
        <Switch>
            <Route
                exact
                path="/reports"
                render={() => (
                    <SummarizeTestPlanReports
                        testPlanReports={data.testPlanReports}
                    />
                )}
            />
            <Route
                exact
                path="/reports/:testPlanVersionId"
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
                path="/reports/:testPlanVersionId/targets/:testPlanReportId"
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
                            ats={data.ats}
                            browsers={data.browsers}
                        />
                    );
                }}
            />
            <Redirect to="/404" />
        </Switch>
    );
};

export default Reports;
