import React, { Fragment } from 'react';
import { useQuery } from '@apollo/client';
import { REPORTS_PAGE_QUERY } from './queries';
import SummarizeTestPlanReports from './SummarizeTestPlanReports';
import SummarizeTestPlanVersion from './SummarizeTestPlanVersion';
import SummarizeTestPlanReport from './SummarizeTestPlanReport';

const Reports = () => {
    const { data } = useQuery(REPORTS_PAGE_QUERY);
    if (!data) return null;

    const testPlanVersion = data.testPlanReports[0].testPlanVersion;
    const testPlanReports = data.testPlanReports.filter(
        testPlanReport =>
            testPlanReport.testPlanVersion.id === testPlanVersion.id
    );

    const testPlanReport = data.testPlanReports[0];

    return (
        <Fragment>
            <SummarizeTestPlanReports testPlanReports={data.testPlanReports} />
            <div style={{ height: '200px' }} />
            <SummarizeTestPlanVersion
                testPlanVersion={testPlanVersion}
                testPlanReports={testPlanReports}
            />
            <div style={{ height: '200px' }} />
            <SummarizeTestPlanReport testPlanReport={testPlanReport} />
            <div style={{ height: '200px' }} />
        </Fragment>
    );
};

export default Reports;
