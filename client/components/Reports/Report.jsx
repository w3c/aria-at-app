import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { useLocation, useRouteMatch } from 'react-router-dom';
import { Redirect, Route, Switch } from 'react-router';
import SummarizeTestPlanReports from './SummarizeTestPlanReports';
import SummarizeTestPlanVersion from './SummarizeTestPlanVersion';
import SummarizeTestPlanReport from './SummarizeTestPlanReport';
import PageStatus from '../common/PageStatus';
import { REPORT_PAGE_QUERY, REPORTS_PAGE_QUERY } from './queries';
import './Reports.css';

const Reports = () => {
    const client = useApolloClient();
    const location = useLocation();
    const match = useRouteMatch('/reports/:testPlanVersionId');
    const testPlanVersionIdExists = !!match?.params?.testPlanVersionId;

    console.log('match', match, match?.params.testPlanVersionId);

    const [currentTestPlanVersionId, setCurrentTestPlanVersionId] = useState();

    const [isReportsLoading, setIsReportsLoading] = useState(false);
    const [reportsData, setReportsData] = useState();
    const [reportsError, setReportsError] = useState();

    const [isReportLoading, setIsReportLoading] = useState(false);
    const [reportData, setReportData] = useState();
    const [reportError, setReportError] = useState();

    // const {
    //     loading /*: reportsLoading*/,
    //     data /*: reportsData*/,
    //     error /*: reportsError*/
    // } = useQuery(REPORTS_PAGE_QUERY);

    useEffect(() => {
      console.log('is this called?')
        if (testPlanVersionIdExists) {
            const testPlanVersionId = match?.params.testPlanVersionId;

            if (!currentTestPlanVersionId) {
                setCurrentTestPlanVersionId(testPlanVersionId);
                (async () => {
                    await updateReportData(testPlanVersionId);
                })();
            } else if (
                currentTestPlanVersionId &&
                testPlanVersionId !== currentTestPlanVersionId
            ) {
                (async () => {
                    await updateReportData(testPlanVersionId);
                })();
            } else if (
                currentTestPlanVersionId &&
                testPlanVersionId === currentTestPlanVersionId
            ) {
                // Do nothing, continue using data
            }
        } else {
            // On top level /reports
            (async () => {
                await updateReportsData();
            })();
        }
    }, [location]);

    const updateReportsData = async () => {
        setIsReportsLoading(true);
        try {
            const { data } = await client.query({
                query: REPORTS_PAGE_QUERY,
                fetchPolicy: 'network-only'
            });
            setReportsData(data);
        } catch (e) {
            setReportsError(e);
        }
        setIsReportsLoading(false);
    };

    const updateReportData = async testPlanVersionId => {
        setIsReportLoading(true);
        try {
            const { data } = await client.query({
                query: REPORT_PAGE_QUERY,
                variables: { testPlanVersionId },
                fetchPolicy: 'network-only'
            });
            setReportData(data);
        } catch (e) {
            setReportError(e);
        }
        setIsReportLoading(false);
    };

    // console.log(
    //     'isReportsLoading',
    //     isReportsLoading,
    //     'reportsData',
    //     reportsData,
    //     'reportsError',
    //     reportsError
    // );
    // console.log(
    //     'isReportLoading',
    //     isReportLoading,
    //     'reportData',
    //     reportData,
    //     'reportError',
    //     reportError
    // );

    if (reportsError || reportsError) {
        const error = reportsError || reportError;
        return (
            <PageStatus
                title="Test Reports | ARIA-AT"
                heading="Test Reports"
                message={error.message}
                isError
            />
        );
    }

    if (isReportsLoading || isReportLoading) {
        return (
            <PageStatus
                title="Loading - Test Reports | ARIA-AT"
                heading="Test Reports"
            />
        );
    }

    if (!reportsData && !reportData) return null;

    return (
        <Switch>
            <Route
                exact
                path="/reports"
                render={() => (
                    <SummarizeTestPlanReports
                        testPlanReports={reportsData.testPlanReports}
                    />
                )}
            />
            <Route
                exact
                path="/reports/:testPlanVersionId"
                render={({ match: { params } }) => {
                    const { testPlanVersionId } = params;

                    const testPlanReports = reportData?.testPlanReports.filter(
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

                    const testPlanReport = reportData?.testPlanReports.find(
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
