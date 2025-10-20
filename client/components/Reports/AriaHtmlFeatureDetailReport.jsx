import React from 'react';
import { useQuery } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { Table, Container, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import PageStatus from '../common/PageStatus';
import { ARIA_HTML_FEATURE_DETAIL_REPORT_QUERY } from './queries';

const AriaHtmlFeatureDetailReport = () => {
  const { atId, browserId, refId } = useParams();

  const { loading, data, error } = useQuery(
    ARIA_HTML_FEATURE_DETAIL_REPORT_QUERY,
    {
      variables: { refId, atId, browserId },
      fetchPolicy: 'cache-and-network'
    }
  );

  if (error) {
    return (
      <PageStatus
        title="ARIA/HTML Feature Report | ARIA-AT"
        heading="ARIA/HTML Feature Support Report"
        message={error.message}
        isError
      />
    );
  }

  if (loading) {
    return (
      <PageStatus
        title="Loading - ARIA/HTML Feature Report | ARIA-AT"
        heading="ARIA/HTML Feature Support Report"
      />
    );
  }

  if (!data || !data.ariaHtmlFeatureDetailReport) return null;

  const { ariaHtmlFeatureDetailReport } = data;
  const { feature, at, browser, assertionStatistics, rows } =
    ariaHtmlFeatureDetailReport;

  const hasData = rows.length > 0;
  const pageTitle = `${at.name} and ${browser.name} Support for ${
    feature.linkText || 'Feature'
  } | ARIA-AT Reports`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <Container
        className="aria-html-feature-detail-report"
        as="main"
        tabIndex="-1"
      >
        <h1>
          {`${at.name} and ${browser.name} Support for `}
          <a href={feature.value} rel="noreferrer" target="_blank">
            {feature.linkText || 'Feature'}
          </a>
        </h1>

        {!hasData && (
          <div className="alert alert-info" role="status">
            No test data available for this ARIA/HTML feature combination.
          </div>
        )}

        <h2>
          Summary of Results for {at.name} and {browser.name}
        </h2>
        <Table bordered responsive aria-label="Assertion Statistics Summary">
          <thead>
            <tr>
              <th></th>
              <th>Passing</th>
              <th>Failing</th>
              <th>Untestable</th>
            </tr>
          </thead>
          <tbody>
            {assertionStatistics.map(stat => (
              <tr key={stat.label}>
                <td>{stat.label}</td>
                <td>
                  {stat.label === 'Percent of Behaviors'
                    ? `${stat.passingPercentage}%`
                    : `${stat.passingCount} of ${stat.passingTotal}`}
                </td>
                <td>
                  {stat.label === 'Percent of Behaviors'
                    ? `${stat.failingPercentage}%`
                    : `${stat.failingCount} of ${stat.failingTotal}`}
                </td>
                <td>
                  {stat.label === 'Percent of Behaviors'
                    ? `${stat.untestablePercentage}%`
                    : `${stat.untestableCount} of ${stat.untestableTotal}`}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Button
          href={`/api/metrics/aria-html-features/details.csv?refId=${refId}&at=${encodeURIComponent(
            at.name
          )}&browser=${encodeURIComponent(browser.name)}`}
          download
          variant="primary"
          className="mb-3"
        >
          Download CSV
        </Button>

        <h2>Raw Data</h2>
        <Table bordered responsive aria-label="Raw assertion data">
          <thead>
            <tr>
              <th>Test Plan</th>
              <th>Test Title</th>
              <th>Command</th>
              <th>Assertion Priority</th>
              <th>Assertion Phrase</th>
              <th>Result</th>
              <th>Last Tested On</th>
              <th>Last Tested AT Version</th>
              <th>Last Tested Browser Version</th>
              <th>Number of severe side Effects</th>
              <th>Number of moderate side Effects</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <Link
                    to={`/report/${row.testPlanVersionId}/targets/${row.testPlanReportId}`}
                  >
                    {row.testPlanName} ({row.testPlanVersion})
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/report/${row.testPlanVersionId}/targets/${row.testPlanReportId}#result-${row.testResultId}`}
                  >
                    {row.testTitle}
                  </Link>
                </td>
                <td>{row.commandSequence}</td>
                <td>{row.assertionPriority}</td>
                <td>{row.assertionPhrase}</td>
                <td>{row.result}</td>
                <td>{row.testedOn}</td>
                <td>{row.atVersion}</td>
                <td>{row.browserVersion}</td>
                <td>{row.severeSideEffectsCount}</td>
                <td>{row.moderateSideEffectsCount}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default AriaHtmlFeatureDetailReport;
