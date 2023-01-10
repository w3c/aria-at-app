import React from 'react';
import { useQuery } from '@apollo/client';
import { Route, Routes, Navigate, useMatch } from 'react-router-dom';
import SummarizeTestPlanVersion from './SummarizeTestPlanVersion';
import SummarizeTestPlanReport from './SummarizeTestPlanReport';
import NotFound from '../NotFound';
import PageStatus from '../common/PageStatus';
import { REPORT_PAGE_QUERY } from './queries';
import './Reports.css';

const Reports = () => {
    const parentMatch = useMatch('/report/:testPlanVersionId');
    const childMatch = useMatch(
        '/report/:testPlanVersionId/targets/:testPlanReportId'
    );

    const { loading, data, error } = useQuery(REPORT_PAGE_QUERY, {
        variables: {
            testPlanVersionId:
                parentMatch?.params?.testPlanVersionId ||
                childMatch?.params?.testPlanVersionId
        },
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

    let testPlanVersionId;
    let testPlanReports;
    let testPlanReport;

    if (parentMatch) {
        const { testPlanVersionId: _testPlanVersionId } = parentMatch.params;
        const _testPlanReports = data.testPlanReports.filter(
            each => each.testPlanVersion.id === _testPlanVersionId
        );

        testPlanVersionId = _testPlanVersionId;
        testPlanReports = _testPlanReports;
    }

    if (childMatch) {
        const {
            testPlanVersionId: _testPlanVersionId,
            testPlanReportId
        } = childMatch.params;
        const _testPlanReport = data.testPlanReports.find(
            each =>
                each.testPlanVersion.id === _testPlanVersionId &&
                each.id == testPlanReportId
        );

        testPlanVersionId = _testPlanVersionId;
        testPlanReport = _testPlanReport;
    }

    // For /report/:testPlanVersionId
    if (parentMatch && !testPlanVersionId) return <Navigate to="/404" />;

    // For /report/:testPlanVersionId/targets/:testPlanReportId
    if (childMatch && !testPlanReport) return <Navigate to="/404" />;

    return (
        <Routes>
            {parentMatch && (
                <Route
                    path="/"
                    element={
                        <SummarizeTestPlanVersion
                            testPlanVersion={testPlanReports[0].testPlanVersion}
                            testPlanReports={testPlanReports}
                        />
                    }
                />
            )}
            {childMatch && (
                <Route
                    path="/targets/:testPlanReportId"
                    element={
                        <SummarizeTestPlanReport
                            testPlanReport={testPlanReport}
                        />
                    }
                />
            )}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default Reports;
