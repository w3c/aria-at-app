/* TEMP */
/* eslint react/prop-types: 0 */

import React from 'react';
import { useQuery } from '@apollo/client';
import { differenceBy } from 'lodash';
import { REPORTS_PAGE_QUERY } from './queries';

const sum = arr => arr.reduce((total, item) => total + item, 0);

const countAssertions = ({
    testPlanReport, // Choose one to provide
    testResult, // Choose one to provide
    scenarioResult, // Choose one to provide
    priority,
    passedOnly
}) => {
    const countScenarioResult = scenarioResult => {
        const all = scenarioResult[`${priority.toLowerCase()}AssertionResults`];
        if (passedOnly) return all.filter(each => each.passed).length;
        return all.length;
    };
    const countTestResult = testResult => {
        return sum(testResult.scenarioResults.map(countScenarioResult));
    };
    const countTestPlanReport = testPlanReport => {
        return sum(testPlanReport.finalizedTestResults.map(countTestResult));
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const countUnexpectedBehaviors = ({
    scenarioResult, // Choose one to provide
    testResult, // Choose one to provide
    testPlanReport // Choose one to provide
}) => {
    const countScenarioResult = scenarioResult => {
        return scenarioResult.unexpectedBehaviors.length;
    };
    const countTestResult = testResult => {
        return sum(testResult.scenarioResults.map(countScenarioResult));
    };
    const countTestPlanReport = testPlanReport => {
        return sum(testPlanReport.finalizedTestResults.map(countTestResult));
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const getSupportPercent = testPlanReport => {
    const passedCount = countAssertions({
        testPlanReport,
        priority: 'REQUIRED',
        passedOnly: true
    });
    const totalCount = countAssertions({
        testPlanReport,
        priority: 'REQUIRED'
    });
    return Math.round((passedCount / totalCount) * 100);
};

const getFormattedMetrics = ({
    scenarioResult, // Choose one to provide
    testResult, // Choose one to provide
    testPlanReport // Choose one to provide
}) => {
    const result = { scenarioResult, testResult, testPlanReport };
    const requiredPassing = countAssertions({
        ...result,
        priority: 'REQUIRED',
        passedOnly: true
    });
    const requiredAll = countAssertions({
        ...result,
        priority: 'REQUIRED'
    });
    const optionalPassing = countAssertions({
        ...result,
        priority: 'OPTIONAL',
        passedOnly: true
    });
    const optionalAll = countAssertions({
        ...result,
        priority: 'OPTIONAL'
    });
    const required = `${requiredPassing} / ${requiredAll}`;
    const optional =
        optionalAll === 0 ? '-' : `${optionalPassing} / ${optionalAll}`;
    const unexpectedBehaviorCount = countUnexpectedBehaviors({ ...result });
    const unexpectedBehaviors =
        unexpectedBehaviorCount === 0 ? '-' : unexpectedBehaviorCount;

    return {
        required,
        optional,
        unexpectedBehaviors
    };
};

const TestPlanReportSummary = ({ testPlanReport }) => {
    const skippedTests = differenceBy(
        testPlanReport.runnableTests,
        testPlanReport.finalizedTestResults,
        testOrTestResult => testOrTestResult.test?.id ?? testOrTestResult.id
    );
    const overallMetrics = getFormattedMetrics({ testPlanReport });

    const { testPlanVersion } = testPlanReport;
    const { exampleUrl, designPattern } = testPlanVersion.metadata;
    return (
        <>
            <h3>Metadata</h3>
            <ul>
                {exampleUrl ? (
                    <li>
                        <a href={exampleUrl} target="_blank" rel="noreferrer">
                            Example Under Test
                        </a>
                    </li>
                ) : null}
                {designPattern ? (
                    <li>
                        <a
                            href={designPattern}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Design Pattern
                        </a>
                    </li>
                ) : null}
            </ul>

            <table>
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Required Assertions</th>
                        <th>Optional Assertions</th>
                        <th>Unexpected Behaviors</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>All Tests</td>
                        <td>{overallMetrics.required}</td>
                        <td>{overallMetrics.optional}</td>
                        <td>{overallMetrics.unexpectedBehaviors}</td>
                    </tr>
                    {testPlanReport.finalizedTestResults.map(testResult => {
                        const testResultMetrics = getFormattedMetrics({
                            testResult
                        });
                        return (
                            <tr key={testResult.id}>
                                <td>{testResult.test.title}</td>
                                <td>{testResultMetrics.required}</td>
                                <td>{testResultMetrics.optional}</td>
                                <td>{testResultMetrics.unexpectedBehaviors}</td>
                            </tr>
                        );
                    })}
                    {skippedTests.map(test => (
                        <tr key={test.id}>
                            <td>{test.title}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

const ReportsPage = () => {
    const { data } = useQuery(REPORTS_PAGE_QUERY);
    if (!data) return null;

    return (
        <>
            <h1>Test Reports</h1>
            {data.testPlanReports.map(testPlanReport => (
                <>
                    <h2>Test Plan</h2>
                    {testPlanReport.testPlanVersion.title}
                    <h2>Target</h2>
                    {testPlanReport.testPlanTarget.browser.name}&nbsp;
                    {testPlanReport.testPlanTarget.browserVersion}&nbsp;/&nbsp;
                    {testPlanReport.testPlanTarget.at.name}&nbsp;
                    {testPlanReport.testPlanTarget.atVersion}
                    <h2>Support Percent</h2>
                    {getSupportPercent(testPlanReport)}
                    <br />
                </>
            ))}
            <br />
            <h1>Test Report</h1>
            <TestPlanReportSummary testPlanReport={data.testPlanReports[0]} />
        </>
    );
};

export default ReportsPage;
