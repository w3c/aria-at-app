import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';
import styled from '@emotion/styled';
import alphabetizeObjectBy from '../../utils/alphabetizeObjectBy';
import getMetrics, { none } from './getMetrics';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';

const FullHeightContainer = styled(Container)`
    min-height: calc(100vh - 64px);
`;

const SummarizeTestPlanReports = ({ testPlanReports }) => {
    if (!testPlanReports.length) {
        return (
            <FullHeightContainer id="main" as="main" tabIndex="-1">
                <Helmet>
                    <title>ARIA-AT Test Reports</title>
                </Helmet>
                <h1>Test Reports</h1>
                <p>
                    There are no results to show just yet. Please check back
                    soon!
                </p>
            </FullHeightContainer>
        );
    }

    const testPlanReportsById = {};
    let testPlanTargetsById = {};
    let testPlanVersionsById = {};
    testPlanReports.forEach(testPlanReport => {
        const { testPlanVersion, at, browser } = testPlanReport;

        // Construct testPlanTarget
        const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
        testPlanReportsById[testPlanReport.id] = testPlanReport;
        testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
        testPlanVersionsById[testPlanVersion.id] = testPlanVersion;
    });
    testPlanTargetsById = alphabetizeObjectBy(testPlanTargetsById, keyValue =>
        getTestPlanTargetTitle(keyValue[1])
    );
    testPlanVersionsById = alphabetizeObjectBy(testPlanVersionsById, keyValue =>
        getTestPlanVersionTitle(keyValue[1])
    );

    const tabularReports = {};
    Object.keys(testPlanVersionsById).forEach(testPlanVersionId => {
        tabularReports[testPlanVersionId] = {};
        Object.keys(testPlanTargetsById).forEach(testPlanTargetId => {
            tabularReports[testPlanVersionId][testPlanTargetId] = null;
        });
    });
    testPlanReports.forEach(testPlanReport => {
        const { testPlanVersion, at, browser } = testPlanReport;

        // Construct testPlanTarget
        const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
        tabularReports[testPlanVersion.id][testPlanTarget.id] = testPlanReport;
    });

    return (
        <FullHeightContainer id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>ARIA-AT Test Reports</title>
            </Helmet>
            <h1>Test Reports</h1>
            <h2>Introduction</h2>
            <p>
                This page offers a high-level view of all results which have
                been collected, reviewed and published by the ARIA-AT project.
                Please note that the review process for tests has not yet been
                formalized, so all tests are in a candidate state. Follow a link
                in the table below to view detailed results.
            </p>
            <h2>Support Levels</h2>
            <p id="support-levels-table-description">
                The percentage of assertions which passed when each Test Plan
                was executed by a given Assistive Technology and Browser.
            </p>
            <Table bordered responsive aria-label="Support Levels">
                <thead>
                    <tr>
                        <th>Test Plan</th>
                        {Object.values(testPlanTargetsById).map(
                            testPlanTarget => (
                                <th key={testPlanTarget.id}>
                                    {getTestPlanTargetTitle(testPlanTarget)}
                                </th>
                            )
                        )}
                    </tr>
                </thead>
                <tbody>
                    {Object.values(testPlanVersionsById).map(
                        testPlanVersion => {
                            return (
                                <tr key={testPlanVersion.id}>
                                    <td>
                                        <Link
                                            to={`/reports/${testPlanVersion.id}`}
                                        >
                                            {getTestPlanVersionTitle(
                                                testPlanVersion
                                            )}
                                        </Link>
                                    </td>
                                    {Object.values(testPlanTargetsById).map(
                                        testPlanTarget => {
                                            const testPlanReport =
                                                tabularReports[
                                                    testPlanVersion.id
                                                ][testPlanTarget.id];
                                            if (!testPlanReport) {
                                                return (
                                                    <td
                                                        key={`${testPlanVersion.id}-${testPlanTarget.id}`}
                                                    >
                                                        {none}
                                                    </td>
                                                );
                                            }
                                            const metrics = getMetrics({
                                                testPlanReport
                                            });
                                            return (
                                                <td key={testPlanReport.id}>
                                                    <Link
                                                        to={
                                                            `/reports/${testPlanVersion.id}` +
                                                            `/targets/${testPlanReport.id}`
                                                        }
                                                    >
                                                        <div className="progress">
                                                            <div
                                                                className="progress-bar bg-info"
                                                                style={{
                                                                    width: `${metrics.supportPercent}%`
                                                                }}
                                                            >
                                                                {
                                                                    metrics.supportPercent
                                                                }
                                                                %
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </td>
                                            );
                                        }
                                    )}
                                </tr>
                            );
                        }
                    )}
                </tbody>
            </Table>
        </FullHeightContainer>
    );
};

SummarizeTestPlanReports.propTypes = {
    testPlanReports: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            testPlanVersion: PropTypes.shape({
                id: PropTypes.string.isRequired,
                title: PropTypes.string,
                testPlan: PropTypes.shape({
                    directory: PropTypes.string.isRequired
                }).isRequired
            }).isRequired
        })
    ).isRequired
};

export default SummarizeTestPlanReports;
