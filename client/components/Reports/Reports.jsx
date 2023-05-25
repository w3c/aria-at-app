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

    return <SummarizeTestPlanReports testPlanReports={data.testPlanReports} />;
};

export default Reports;
