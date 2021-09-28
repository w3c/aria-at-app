import React from 'react';
import PropTypes from 'prop-types';
import alphabetizeObjectBy from '../../utils/alphabetizeObjectBy';
import getMetrics from './getMetrics';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';

const SummarizeTestPlanReports = ({ testPlanReports }) => {
    const testPlanReportsById = {};
    let testPlanTargetsById = {};
    let testPlanVersionsById = {};
    testPlanReports.forEach(testPlanReport => {
        const { testPlanTarget, testPlanVersion } = testPlanReport;
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
        const { testPlanTarget, testPlanVersion } = testPlanReport;
        tabularReports[testPlanVersion.id][testPlanTarget.id] = testPlanReport;
    });

    return (
        <>
            <h1>Summary</h1>
            <table>
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
                            const title = getTestPlanVersionTitle(
                                testPlanVersion
                            );

                            return (
                                <tr key={testPlanVersion.id}>
                                    <td>{title}</td>
                                    {Object.values(testPlanTargetsById).map(
                                        testPlanTarget => {
                                            const testPlanReport =
                                                tabularReports[
                                                    testPlanVersion.id
                                                ][testPlanTarget.id];
                                            const metrics = getMetrics({
                                                testPlanReport
                                            });
                                            return (
                                                <td key={testPlanReport.id}>
                                                    {metrics.supportPercent}
                                                </td>
                                            );
                                        }
                                    )}
                                </tr>
                            );
                        }
                    )}
                </tbody>
            </table>
        </>
    );
};

SummarizeTestPlanReports.propTypes = {
    testPlanReports: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            testPlanTarget: PropTypes.shape({
                id: PropTypes.string.isRequired,
                browser: PropTypes.shape({
                    name: PropTypes.string.isRequired
                }).isRequired,
                at: PropTypes.shape({
                    name: PropTypes.string.isRequired
                }).isRequired,
                browserVersion: PropTypes.string.isRequired,
                atVersion: PropTypes.string.isRequired
            }).isRequired,
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
