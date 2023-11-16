import React from 'react';
import { useQuery } from '@apollo/client';
import SummarizeTestPlanReports from './SummarizeTestPlanReports';
import PageStatus from '../common/PageStatus';
import { REPORTS_PAGE_QUERY } from './queries';
import './Reports.css';

const Reports = () => {
    const { loading, data, error } = useQuery(REPORTS_PAGE_QUERY, {
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
        <SummarizeTestPlanReports
            testPlanVersions={data.testPlanVersions.filter(
                testPlanVersion => testPlanVersion.testPlanReports.length
            )}
        />
    );
};

export default Reports;
