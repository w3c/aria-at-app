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
import { getMetrics, dates } from 'shared';
import { None } from '@components/common/None';
import DisclaimerInfo from '../DisclaimerInfo';
import TestPlanResultsTable from '../common/TestPlanResultsTable';
import DisclosureComponent from '../common/DisclosureComponent';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import createIssueLink from '../../utils/createIssueLink';
import summarizeAssertions from '../../utils/summarizeAssertions.js';
import RunHistory from '../common/RunHistory';
import {
  TestPlanReportPropType,
  TestPlanVersionPropType
} from '../common/proptypes';
import FailingAssertionsSummaryTable from '../FailingAssertionsSummary/Table';
import FailingAssertionsSummaryHeading from '../FailingAssertionsSummary/Heading';
import NegativeSideEffectsSummaryTable from '../NegativeSideEffectsSummary/Table';
import NegativeSideEffectsSummaryHeading from '../NegativeSideEffectsSummary/Heading';
import UntestableAssertionsSummaryTable from '../UntestableAssertionsSummary/Table';
import UntestableAssertionsSummaryHeading from '../UntestableAssertionsSummary/Heading';
import styles from './SummarizeTestPlanReport.module.css';
import commonStyles from '../common/styles.module.css';

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

  const none = None('No Data');

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
          The following table displays a summary of data for all versions of{' '}
          {testPlanTarget.at.name} that have been tested.
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
              const { recommendedAtVersion, metrics } = testPlanReport;
              const { mustFormatted, shouldFormatted, mayFormatted } = metrics;

              return (
                <tr key={`VersionsSummaryRow_${testPlanReport.id}`}>
                  <td>
                    {testPlanReportId === testPlanReport.id ? (
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
        <Table bordered responsive aria-label={title}>
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
              const { mustFormatted, shouldFormatted, mayFormatted } =
                getMetrics({
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

  const renderFailingAssertionsSummary = () => {
    if (
      testPlanReport.metrics.mustAssertionsFailedCount === 0 &&
      testPlanReport.metrics.shouldAssertionsFailedCount === 0
    ) {
      return null;
    }

    return (
      <>
        <FailingAssertionsSummaryHeading metrics={testPlanReport.metrics} />
        <FailingAssertionsSummaryTable
          testPlanReport={testPlanReport}
          atName={testPlanReport.at.name}
          testPlanVersion={testPlanVersion}
          getLinkUrl={assertion =>
            `/report/${testPlanVersion.id}/targets/${testPlanReport.id}#result-${assertion.testResultId}`
          }
        />
      </>
    );
  };

  const renderNegativeSideEffectsSummary = () => {
    if (testPlanReport.metrics.negativeSideEffectCount === 0) {
      return null;
    }

    return (
      <>
        <NegativeSideEffectsSummaryHeading metrics={testPlanReport.metrics} />
        <NegativeSideEffectsSummaryTable
          testPlanReport={testPlanReport}
          atName={testPlanReport.at.name}
          testPlanVersion={testPlanVersion}
          getLinkUrl={assertion =>
            `/report/${testPlanVersion.id}/targets/${testPlanReport.id}#result-${assertion.testResultId}`
          }
        />
      </>
    );
  };

  const renderUntestableAssertionsSummary = () => {
    // Use truthiness check (rather than strict equality to zero) in order to
    // support legacy reports whose metrics have been memoized and thus do not
    // include properties for untestable assertions.
    if (
      !testPlanReport.metrics.mustAssertionsUntestableCount &&
      !testPlanReport.metrics.shouldAssertionsUntestableCount
    ) {
      return null;
    }

    return (
      <>
        <UntestableAssertionsSummaryHeading metrics={testPlanReport.metrics} />
        <UntestableAssertionsSummaryTable
          testPlanReport={testPlanReport}
          atName={testPlanReport.at.name}
          getLinkUrl={assertion =>
            `/report/${testPlanVersion.id}/targets/${testPlanReport.id}#result-${assertion.testResultId}`
          }
        />
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
        This page shows detailed results for each test, including individual
        commands that the tester entered into the AT, the output which was
        captured from the AT in response, and whether that output was deemed
        passing or failing for each of the assertions. The open test button next
        to each test allows you to preview the test in your browser.
      </p>
      <h2>Metadata</h2>
      <ul>
        <li>
          Generated from&nbsp;
          <a href={`/test-review/${testPlanVersion.id}`}>
            {testPlanVersion.versionString} of {testPlanVersion.title} Test Plan
          </a>
        </li>
        <li>
          Report completed on{' '}
          {dates.convertDateToString(
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
            <a href={designPatternUrl} target="_blank" rel="noreferrer">
              Design Pattern
            </a>
          </li>
        ) : null}
      </ul>

      {renderVersionsSummaryTable()}
      {renderResultsForTargetTable()}
      {renderFailingAssertionsSummary()}
      {renderNegativeSideEffectsSummary()}
      {renderUntestableAssertionsSummary()}
      {testPlanReport.finalizedTestResults.map((testResult, index) => {
        const test = testResult.test;

        const reportLink = `https://aria-at.w3.org${location.pathname}#result-${testResult.id}`;
        const issueLink = createIssueLink({
          testPlanTitle: testPlanVersion.title,
          testPlanDirectory: testPlanVersion.testPlan.directory,
          versionString: testPlanVersion.versionString,
          testTitle: test.title,
          testRowNumber: test.rowNumber,
          testSequenceNumber: index + 1,
          testRenderedUrl: test.renderedUrl,
          atName: testPlanReport.at.name,
          atVersionName: testResult.atVersion.name,
          browserName: testPlanReport.browser.name,
          browserVersionName: testResult.browserVersion.name,
          versionPhase: testPlanVersion.phase,
          reportLink
        });

        // TODO: fix renderedUrl
        let modifiedRenderedUrl = test.renderedUrl.replace(
          /.+(?=\/tests)/,
          'https://aria-at.netlify.app'
        );

        const assertionsSummary = summarizeAssertions(
          getMetrics({
            testResult
          })
        );

        return (
          <Fragment key={testResult.id}>
            <div className={styles.testResultHeading}>
              <h2 id={`result-${testResult.id}`} tabIndex="-1">
                Test {index + 1}: {test.title}&nbsp;({assertionsSummary})
                <DisclaimerInfo phase={testPlanVersion.phase} />
              </h2>
              <div className={styles.testResultButtons}>
                <Button
                  target="_blank"
                  rel="noreferrer"
                  href={issueLink}
                  variant="secondary"
                >
                  <FontAwesomeIcon
                    icon={faExclamationCircle}
                    className={commonStyles.darkGray}
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
                    className={commonStyles.darkGray}
                  />
                  Open Test
                </Button>
              </div>
            </div>

            <div className={styles.reportResultsContainer}>
              <TestPlanResultsTable
                key={`TestPlanResultsTable__${testResult.id}`}
                test={{ ...test, at }}
                testResult={testResult}
                optionalHeader={<h3>Results for each command</h3>}
                commandHeadingLevel={4}
                showAriaHtmlFeatures
              />
            </div>

            <DisclosureComponent
              componentId={`runHistory_${testResult.id}`}
              title="Run History"
              disclosureContainerView={
                <RunHistory
                  testPlanReports={[testPlanReport]}
                  testId={testResult.test.id}
                />
              }
            />
          </Fragment>
        );
      })}
    </Container>
  );
};

SummarizeTestPlanReport.propTypes = {
  testPlanVersion: TestPlanVersionPropType.isRequired,
  testPlanReports: PropTypes.arrayOf(TestPlanReportPropType).isRequired
};

export default SummarizeTestPlanReport;
