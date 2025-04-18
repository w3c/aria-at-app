import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { None } from '@components/common/None';
import { getMetrics, dates } from 'shared';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';
import { Breadcrumb, Button, Container, Table } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import DisclaimerInfo from '../DisclaimerInfo';
import {
  TestPlanReportPropType,
  TestPlanVersionPropType
} from '../common/proptypes';
import styles from './SummarizeTestPlanVersion.module.css';
import commonStyles from '../common/styles.module.css';

const SummarizeTestPlanVersion = ({ testPlanVersion, testPlanReports }) => {
  const { exampleUrl, designPatternUrl } = testPlanVersion.metadata;

  // Sort the test plan reports alphabetically by AT name first, then browser
  const sortedTestPlanReports = testPlanReports.slice().sort((a, b) => {
    const atNameA = a.at.name.toLowerCase();
    const atNameB = b.at.name.toLowerCase();
    const browserNameA = a.browser.name.toLowerCase();
    const browserNameB = b.browser.name.toLowerCase();

    if (atNameA < atNameB) return -1;
    if (atNameA > atNameB) return 1;

    if (browserNameA < browserNameB) return -1;
    if (browserNameA > browserNameB) return 1;

    return 0;
  });

  const none = None();

  return (
    <Container
      id="main"
      as="main"
      tabIndex="-1"
      className={commonStyles.fhContainer}
    >
      <Helmet>
        <title>
          {getTestPlanVersionTitle(testPlanVersion)} | ARIA-AT Reports
        </title>
      </Helmet>
      <h1>{getTestPlanVersionTitle(testPlanVersion)}</h1>

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
        <Breadcrumb.Item active>
          {getTestPlanVersionTitle(testPlanVersion)}
        </Breadcrumb.Item>
      </Breadcrumb>
      <h2>Introduction</h2>

      <DisclaimerInfo phase={testPlanVersion.phase} />
      <p>
        This page summarizes the test results for each AT and Browser which
        executed the Test Plan.
      </p>
      <h2>Metadata</h2>
      <ul>
        <li>
          Generated from&nbsp;
          <a href={`/test-review/${testPlanVersion.id}`}>
            {testPlanVersion.versionString} of {testPlanVersion.title} Test Plan
          </a>
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

      {sortedTestPlanReports.map(testPlanReport => {
        if (testPlanReport.status === 'DRAFT') return null;
        const overallMetrics = getMetrics({ testPlanReport });

        const { at, browser, recommendedAtVersion } = testPlanReport;

        // Construct testPlanTarget
        const testPlanTarget = {
          id: `${at.id}${browser.id}`,
          at,
          browser,
          atVersion: recommendedAtVersion
        };

        return (
          <Fragment key={testPlanReport.id}>
            <h2>{getTestPlanTargetTitle(testPlanTarget)}</h2>
            <p>
              Report completed on{' '}
              {dates.convertDateToString(
                new Date(testPlanReport.markedFinalAt),
                'MMMM D, YYYY'
              )}
            </p>
            <DisclaimerInfo phase={testPlanVersion.phase} />
            <LinkContainer
              to={
                `/report/${testPlanVersion.id}` +
                `/targets/${testPlanReport.id}`
              }
            >
              <Button variant="secondary">View Complete Results</Button>
            </LinkContainer>
            <Table
              bordered
              responsive
              className={styles.reports}
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
          </Fragment>
        );
      })}
    </Container>
  );
};

SummarizeTestPlanVersion.propTypes = {
  testPlanVersion: TestPlanVersionPropType.isRequired,
  testPlanReports: PropTypes.arrayOf(TestPlanReportPropType).isRequired
};

export default SummarizeTestPlanVersion;
