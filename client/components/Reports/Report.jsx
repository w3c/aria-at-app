import React from 'react';
import { useQuery } from '@apollo/client';
import { Route, Routes, Navigate, useParams } from 'react-router-dom';
import SummarizeTestPlanVersion from './SummarizeTestPlanVersion';
import SummarizeTestPlanReport from './SummarizeTestPlanReport';
import PageStatus from '../common/PageStatus';
import { REPORT_PAGE_QUERY } from './queries';
import './Reports.css';

const Report = () => {
    const { testPlanVersionId } = useParams();

    const { loading, data, error } = useQuery(REPORT_PAGE_QUERY, {
        variables: { testPlanVersionId: testPlanVersionId },
        fetchPolicy: 'cache-and-network'
    });

    if (error) {
        return (
            <PageStatus
                title="AT Interop Reports | ARIA-AT"
                heading="Assistive Technology Interoperability Reports"
                message={error.message}
                isError
            />
        );
    }

    if (loading) {
        return (
            <PageStatus
                title="Loading - AT Interop Reports | ARIA-AT"
                heading="Assistive Technology Interoperability Reports"
            />
        );
    }

    if (!data) return null;

    return (
        <Routes>
            <Route
                index
                element={
                    <SummarizeTestPlanVersion
                        testPlanVersion={data.testPlanVersion}
                        testPlanReports={data.testPlanVersion.testPlanReports}
                    />
                }
            />
            <Route
                path="targets/:testPlanReportId"
                element={
                    <SummarizeTestPlanReport
                        testPlanVersion={data.testPlanVersion}
                        testPlanReports={data.testPlanVersion.testPlanReports}
                    />
                }
            />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
};

export default Report;
