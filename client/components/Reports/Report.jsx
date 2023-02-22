import React from 'react';
import { useQuery } from '@apollo/client';
import { Route, Routes, Navigate } from 'react-router';
import SummarizeTestPlanVersion from './SummarizeTestPlanVersion';
import SummarizeTestPlanReport from './SummarizeTestPlanReport';
import PageStatus from '../common/PageStatus';
import { REPORT_PAGE_QUERY } from './queries';
import './Reports.css';
import { useParams } from 'react-router-dom';

const Report = () => {
    const { testPlanVersionId } = useParams();

    let testPlanVersionIds = [];

    if (testPlanVersionId.includes(','))
        testPlanVersionIds = testPlanVersionId.split(',');

    const { loading, data, error } = useQuery(REPORT_PAGE_QUERY, {
        variables: testPlanVersionIds.length
            ? { testPlanVersionIds }
            : { testPlanVersionId },
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

    const testPlanReports = data.testPlanReports.filter(
        each =>
            each.testPlanVersion.id === testPlanVersionId ||
            testPlanVersionIds.includes(each.testPlanVersion.id)
    );

    const combineArray = testPlanReports => {
        let testPlanTargetsById = {};
        testPlanReports.forEach(testPlanReport => {
            const { at, browser } = testPlanReport;

            // Construct testPlanTarget
            const testPlanTargetId = `${at.id}${browser.id}`;

            if (!testPlanTargetsById[testPlanTargetId]) {
                testPlanTargetsById[testPlanTargetId] = [{ ...testPlanReport }];
            } else
                testPlanTargetsById[testPlanTargetId].push({
                    ...testPlanReport
                });
        });

        return Object.values(testPlanTargetsById).map(testPlanReports => {
            return testPlanReports.reduce((prev, curr) => {
                const latestPrevDate = new Date(
                    prev.latestAtVersionReleasedAt.releasedAt
                );

                const latestCurrDate = new Date(
                    curr.latestAtVersionReleasedAt.releasedAt
                );

                return latestPrevDate > latestCurrDate ? prev : curr;
            });
        });
    };

    if(!testPlanReports || testPlanReports.length < 1) {
        return <Navigate to="/404" replace />
    }

    return (
        <Routes>
            <Route
                index
                element={
                        <SummarizeTestPlanVersion
                            testPlanVersion={testPlanReports[0].testPlanVersion}
                            testPlanReports={combineArray(testPlanReports)}
                        />
                }
            />
            <Route
                path="targets/:testPlanReportId"
                element={
                    <SummarizeTestPlanReport
                        testPlanReports={testPlanReports}
                    />
                }
            />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
};

export default Report;
