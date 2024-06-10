import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';
import { Breadcrumb, Button, Container, Table } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faExclamationCircle,
    faExternalLinkAlt,
    faHome
} from '@fortawesome/free-solid-svg-icons';
import styled from '@emotion/styled';
import { getMetrics } from 'shared';
import { none } from './None';
import { convertDateToString } from '../../utils/formatter';
import DisclaimerInfo from '../DisclaimerInfo';
import TestPlanResultsTable from '../common/TestPlanResultsTable';
import DisclosureComponent from '../common/DisclosureComponent';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import createIssueLink from '../../utils/createIssueLink';

const ResultsContainer = styled.div`
    padding: 1em 1.75em;
    border-left: 1px solid #dee2e6;
    border-right: 1px solid #dee2e6;
    border-bottom: 1px solid #dee2e6;
    margin-bottom: 0.5em;
`;

const getTestersRunHistory = (
    testPlanReport,
    testId,
    draftTestPlanRuns = []
) => {
    const { id: testPlanReportId, at, browser } = testPlanReport;
    let lines = [];

    draftTestPlanRuns.forEach(draftTestPlanRun => {
        const { testPlanReport, testResults, tester } = draftTestPlanRun;

        const testResult = testResults.find(item => item.test.id === testId);
        if (testPlanReportId === testPlanReport.id && testResult?.completedAt) {
            lines.push(
                <li
                    key={`${testResult.atVersion.id}-${testResult.browserVersion.id}-${testResult.test.id}-${tester.username}`}
                >
                    Tested with{' '}
                    <b>
                        {at.name} {testResult.atVersion.name}
                    </b>{' '}
                    and{' '}
                    <b>
                        {browser.name} {testResult.browserVersion.name}
                    </b>{' '}
                    by{' '}
                    <b>
                        <a href={`https://github.com/${tester.username}`}>
                            {tester.username}
                        </a>
                    </b>{' '}
                    on{' '}
                    {convertDateToString(
                        testResult.completedAt,
                        'MMMM DD, YYYY'
                    )}
                    .
                </li>
            );
        }
    });

    return (
        <ul
            style={{
                marginBottom: '0'
            }}
        >
            {lines}
        </ul>
    );
};

const SummarizeTestPlanReport = ({ testPlanVersion, testPlanReports }) => {
    const { exampleUrl, designPatternUrl } = testPlanVersion.metadata;
    const location = useLocation();
    const { testPlanReportId } = useParams();

    const testPlanReport = testPlanReports.find(
        each => each.id == testPlanReportId
    );
    if (!testPlanReport) return <Navigate to="/404" />;

    const { at, browser, recommendedAtVersion } = testPlanReport;
    const overallMetrics = getMetrics({ testPlanReport });

    // Construct testPlanTarget
    const testPlanTarget = {
        id: `${at.id}${browser.id}`,
        at,
        browser,
        atVersion: recommendedAtVersion
    };

    const renderVersionsSummaryTable = () => {
        if (testPlanVersion.phase !== 'RECOMMENDED') return null;

        const title = `${testPlanTarget.at.name} Versions Summary`;
        const testPlanReportsForTarget = testPlanVersion.testPlanReports.filter(
            testPlanReport =>
                testPlanReport.at.id === at.id &&
                testPlanReport.browser.id === browser.id
        );
        testPlanReportsForTarget.sort(
            (a, b) =>
                new Date(b.recommendedAtVersion.releasedAt) -
                new Date(a.recommendedAtVersion.releasedAt)
        );

        return (
            <>
                <h2>{title}</h2>
                <p>
                    The following table displays a summary of data for all
                    versions of {testPlanTarget.at.name} that have been tested.
                </p>
                <Table bordered responsive>
                    <thead>
                        <tr>
                            <th>Versions</th>
                            <th>Must-Have Behaviors</th>
                            <th>Should-Have Behaviors</th>
                            <th>May-Have Behaviors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testPlanReportsForTarget.map(testPlanReport => {
                            const { recommendedAtVersion, metrics } =
                                testPlanReport;
                            const {
                                mustFormatted,
                                shouldFormatted,
                                mayFormatted
                            } = metrics;

                            return (
                                <tr
                                    key={`VersionsSummaryRow_${testPlanReport.id}`}
                                >
                                    <td>
                                        {testPlanReportId ===
                                        testPlanReport.id ? (
                                            <>{recommendedAtVersion.name}</>
                                        ) : (
                                            <Link
                                                to={
                                                    `/report/${testPlanVersion.id}` +
                                                    `/targets/${testPlanReport.id}`
                                                }
                                            >
                                                {recommendedAtVersion.name}
                                            </Link>
                                        )}
                                    </td>
                                    <td>{mustFormatted || none}</td>
                                    <td>{shouldFormatted || none}</td>
                                    <td>{mayFormatted || none}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </>
        );
    };

    const renderResultsForTargetTable = () => {
        const title = `Results for ${getTestPlanTargetTitle(testPlanTarget)}`;
        return (
            <>
                <h2>{title}</h2>
                <Table
                    bordered
                    responsive
                    aria-label={`Results for ${getTestPlanTargetTitle(
                        testPlanTarget
                    )}`}
                >
                    <thead>
                        <tr>
                            <th>Test Name</th>
                            <th>Must-Have Behaviors</th>
                            <th>Should-Have Behaviors</th>
                            <th>May-Have Behaviors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testPlanReport.finalizedTestResults.map(testResult => {
                            const {
                                mustFormatted,
                                shouldFormatted,
                                mayFormatted
                            } = getMetrics({
                                testResult
                            });
                            return (
                                <tr key={testResult.id}>
                                    <td>
                                        <Link
                                            to={
                                                `/report/${testPlanVersion.id}` +
                                                `/targets/${testPlanReport.id}` +
                                                `#result-${testResult.id}`
                                            }
                                        >
                                            {testResult.test.title}
                                        </Link>
                                    </td>
                                    <td>{mustFormatted || none}</td>
                                    <td>{shouldFormatted || none}</td>
                                    <td>{mayFormatted || none}</td>
                                </tr>
                            );
                        })}
                        <tr>
                            <td>All Tests</td>
                            <td>{overallMetrics.mustFormatted || none}</td>
                            <td>{overallMetrics.shouldFormatted || none}</td>
                            <td>{overallMetrics.mayFormatted || none}</td>
                        </tr>
                    </tbody>
                </Table>
            </>
        );
    };

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>
                    {getTestPlanTargetTitle(testPlanTarget)}&nbsp;for&nbsp;
                    {getTestPlanVersionTitle(testPlanVersion)} | ARIA-AT Reports
                </title>
            </Helmet>
            <h1>
                {getTestPlanVersionTitle(testPlanVersion)}&nbsp;with&nbsp;
                {getTestPlanTargetTitle(testPlanTarget)}
            </h1>
            <Breadcrumb
                label="Breadcrumb"
                listProps={{
                    'aria-label': 'Breadcrumb Navigation'
                }}
            >
                <LinkContainer to="/reports">
                    <Breadcrumb.Item>
                        <FontAwesomeIcon icon={faHome} />
                        AT Interoperability Reports
                    </Breadcrumb.Item>
                </LinkContainer>
                <LinkContainer to={`/report/${testPlanVersion.id}`}>
                    <Breadcrumb.Item>
                        {getTestPlanVersionTitle(testPlanVersion)}
                    </Breadcrumb.Item>
                </LinkContainer>
                <Breadcrumb.Item active>
                    {getTestPlanTargetTitle(testPlanTarget)}
                </Breadcrumb.Item>
            </Breadcrumb>
            <h2>Introduction</h2>
            <p>
                This page shows detailed results for each test, including
                individual commands that the tester entered into the AT, the
                output which was captured from the AT in response, and whether
                that output was deemed passing or failing for each of the
                assertions. The open test button next to each test allows you to
                preview the test in your browser.
            </p>
            <h2>Metadata</h2>
            <ul>
                <li>
                    Generated from&nbsp;
                    <a href={`/test-review/${testPlanVersion.id}`}>
                        {testPlanVersion.versionString} of{' '}
                        {testPlanVersion.title} Test Plan
                    </a>
                </li>
                <li>
                    Report completed on{' '}
                    {convertDateToString(
                        new Date(testPlanReport.markedFinalAt),
                        'MMMM D, YYYY'
                    )}
                </li>
                {exampleUrl ? (
                    <li>
                        <a href={exampleUrl} target="_blank" rel="noreferrer">
                            Example Under Test
                        </a>
                    </li>
                ) : null}
                {designPatternUrl ? (
                    <li>
                        <a
                            href={designPatternUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Design Pattern
                        </a>
                    </li>
                ) : null}
            </ul>

            {renderVersionsSummaryTable()}
            {renderResultsForTargetTable()}

            {testPlanReport.finalizedTestResults.map((testResult, index) => {
                const test = testResult.test;

                const reportLink = `https://aria-at.w3.org${location.pathname}#result-${testResult.id}`;
                const issueLink = createIssueLink({
                    testPlanTitle: testPlanVersion.title,
                    testPlanDirectory: testPlanVersion.testPlan.directory,
                    versionString: testPlanVersion.versionString,
                    testTitle: test.title,
                    testRowNumber: test.rowNumber,
                    testRenderedUrl: test.renderedUrl,
                    atName: testPlanReport.at.name,
                    atVersionName: testResult.atVersion.name,
                    browserName: testPlanReport.browser.name,
                    browserVersionName: testResult.browserVersion.name,
                    reportLink
                });

                // TODO: fix renderedUrl
                let modifiedRenderedUrl = test.renderedUrl.replace(
                    /.+(?=\/tests)/,
                    'https://aria-at.netlify.app'
                );

                const { assertionsPassedCount, assertionsFailedCount } =
                    getMetrics({ testResult });

                return (
                    <Fragment key={testResult.id}>
                        <div className="test-result-heading">
                            <h2 id={`result-${testResult.id}`} tabIndex="-1">
                                Test {index + 1}: {test.title}&nbsp;(
                                {assertionsPassedCount}
                                &nbsp;passed, {assertionsFailedCount} failed)
                                <DisclaimerInfo phase={testPlanVersion.phase} />
                            </h2>
                            <div className="test-result-buttons">
                                <Button
                                    target="_blank"
                                    rel="noreferrer"
                                    href={issueLink}
                                    variant="secondary"
                                >
                                    <FontAwesomeIcon
                                        icon={faExclamationCircle}
                                        color="#94979b"
                                    />
                                    Raise an Issue
                                </Button>
                                <Button
                                    target="_blank"
                                    rel="noreferrer"
                                    href={modifiedRenderedUrl}
                                    variant="secondary"
                                >
                                    <FontAwesomeIcon
                                        icon={faExternalLinkAlt}
                                        color="#94979b"
                                    />
                                    Open Test
                                </Button>
                            </div>
                        </div>

                        <ResultsContainer>
                            <TestPlanResultsTable
                                key={`TestPlanResultsTable__${testResult.id}`}
                                test={{ ...test, at }}
                                testResult={testResult}
                                optionalHeader={
                                    <h3>Results for each command</h3>
                                }
                                commandHeadingLevel={4}
                            />
                        </ResultsContainer>

                        <DisclosureComponent
                            componentId={`run-history-${testResult.id}`}
                            title="Run History"
                            disclosureContainerView={getTestersRunHistory(
                                testPlanReport,
                                testResult.test.id,
                                testPlanReport.draftTestPlanRuns
                            )}
                        />
                    </Fragment>
                );
            })}
        </Container>
    );
};

SummarizeTestPlanReport.propTypes = {
    testPlanVersion: PropTypes.object.isRequired,
    testPlanReports: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            runnableTests: PropTypes.arrayOf(PropTypes.object.isRequired)
                .isRequired,
            at: PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired
            }).isRequired,
            browser: PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired
            }).isRequired,
            finalizedTestResults: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    test: PropTypes.shape({
                        title: PropTypes.string.isRequired,
                        renderedUrl: PropTypes.string.isRequired
                    }).isRequired,
                    scenarioResults: PropTypes.arrayOf(
                        PropTypes.shape({
                            id: PropTypes.string.isRequired,
                            output: PropTypes.string.isRequired,
                            assertionResults: PropTypes.arrayOf(
                                PropTypes.shape({
                                    id: PropTypes.string.isRequired,
                                    passed: PropTypes.bool.isRequired,
                                    assertion: PropTypes.shape({
                                        text: PropTypes.string.isRequired
                                    }).isRequired
                                }).isRequired
                            ).isRequired,
                            unexpectedBehaviors: PropTypes.arrayOf(
                                PropTypes.shape({
                                    id: PropTypes.string.isRequired,
                                    text: PropTypes.string.isRequired,
                                    impact: PropTypes.string.isRequired,
                                    details: PropTypes.string.isRequired
                                }).isRequired
                            ).isRequired
                        }).isRequired
                    ).isRequired
                }).isRequired
            ).isRequired,
            draftTestPlanRuns: PropTypes.arrayOf(
                PropTypes.shape({
                    tester: PropTypes.shape({
                        username: PropTypes.string.isRequired
                    })
                })
            )
        }).isRequired
    )
};

export default SummarizeTestPlanReport;
