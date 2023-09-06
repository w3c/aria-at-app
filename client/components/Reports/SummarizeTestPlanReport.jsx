import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';
import { Breadcrumb, Button, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faExclamationCircle,
    faExternalLinkAlt,
    faHome
} from '@fortawesome/free-solid-svg-icons';
import { differenceBy } from 'lodash';
import { convertDateToString } from '../../utils/formatter';
import DisclaimerInfo from '../DisclaimerInfo';
import TestPlanResultsTable from '../common/TestPlanResultsTable';
import { calculateAssertionsCount } from '../common/TestPlanResultsTable/utils';
import DisclosureComponent from '../common/DisclosureComponent';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import createIssueLink from '../../utils/createIssueLink';

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
    const location = useLocation();
    const { testPlanReportId } = useParams();

    const testPlanReport = testPlanReports.find(
        each => each.id == testPlanReportId
    );

    if (!testPlanReport) return <Navigate to="/404" />;

    const { at, browser } = testPlanReport;

    // Construct testPlanTarget
    const testPlanTarget = {
        id: `${at.id}${browser.id}`,
        at,
        browser
    };

    const skippedTests = differenceBy(
        testPlanReport.runnableTests,
        testPlanReport.finalizedTestResults,
        testOrTestResult => testOrTestResult.test?.id ?? testOrTestResult.id
    );

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
                        Test Reports
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
            {testPlanReport.finalizedTestResults.map(testResult => {
                const test = testResult.test;

                const reportLink = `https://aria-at.w3.org${location.pathname}#result-${testResult.id}`;
                const issueLink = createIssueLink({
                    testPlanTitle: testPlanVersion.title,
                    testPlanDirectory: testPlanVersion.testPlan.directory,
                    versionString: `V${convertDateToString(
                        testPlanVersion.updatedAt,
                        'YY.MM.DD'
                    )}`,
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

                const { passedAssertionsCount, failedAssertionsCount } =
                    calculateAssertionsCount(testResult);

                return (
                    <Fragment key={testResult.id}>
                        <div className="test-result-heading">
                            <h2 id={`result-${testResult.id}`} tabIndex="-1">
                                {test.title}&nbsp;({passedAssertionsCount}
                                &nbsp;passed, {failedAssertionsCount} failed)
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

                        <TestPlanResultsTable
                            key={`TestPlanResultsTable__${testResult.id}`}
                            test={{ ...test, at }}
                            testResult={testResult}
                        />

                        <br />
                        <br />

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
            {skippedTests.length ? (
                <Fragment>
                    <div className="skipped-tests-heading">
                        <h2 id="skipped-tests" tabIndex="-1">
                            Skipped Tests
                        </h2>
                        <p>
                            The following tests have been skipped in this test
                            run:
                        </p>
                    </div>
                    <ol className="skipped-tests">
                        {skippedTests.map(test => (
                            <li key={test.id}>
                                <a href={test.renderedUrl}>{test.title}</a>
                            </li>
                        ))}
                    </ol>
                </Fragment>
            ) : null}
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
                                    failedReason: PropTypes.string,
                                    assertion: PropTypes.shape({
                                        text: PropTypes.string.isRequired
                                    }).isRequired
                                }).isRequired
                            ).isRequired,
                            unexpectedBehaviors: PropTypes.arrayOf(
                                PropTypes.shape({
                                    id: PropTypes.string.isRequired,
                                    text: PropTypes.string.isRequired,
                                    otherUnexpectedBehaviorText:
                                        PropTypes.string
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
