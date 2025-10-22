import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';
import clsx from 'clsx';
import alphabetizeObjectBy from '../../utils/alphabetizeObjectBy';
import { derivePhaseName } from '../../utils/aria';
import { None } from '@components/common/None';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';
import ProgressBar from '@components/common/ProgressBar';
import { TestPlanVersionPropType } from '../common/proptypes';
import Tabs from '../common/Tabs';
import KeyMetricsBanner from '../KeyMetricsBanner';
import styles from './SummarizeTestPlanReports.module.css';
import commonStyles from '../common/styles.module.css';
import FeatureSupportTable from './FeatureSupportTable';

const SummarizeTestPlanReports = ({
  testPlanVersions,
  ariaHtmlFeaturesMetrics
}) => {
  if (!testPlanVersions.length) {
    return (
      <Container
        id="main"
        as="main"
        tabIndex="-1"
        className={clsx(commonStyles.fhContainer, styles.reportsContainer)}
      >
        <Helmet>
          <title>AT Interop Reports | ARIA-AT</title>
        </Helmet>
        <section className={styles.contentSection}>
          <h1>Assistive Technology Interoperability Reports</h1>
          <p>There are no results to show just yet. Please check back soon!</p>
        </section>
      </Container>
    );
  }

  let testPlanTargetsById = {};
  testPlanVersions.forEach(testPlanVersion => {
    const { testPlanReports } = testPlanVersion;

    testPlanReports.forEach(testPlanReport => {
      const { at, browser } = testPlanReport;
      // Construct testPlanTarget
      const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
      testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
    });
  });
  testPlanTargetsById = alphabetizeObjectBy(testPlanTargetsById, keyValue =>
    getTestPlanTargetTitle(keyValue[1])
  );

  const none = None();

  return (
    <Container
      id="main"
      as="main"
      tabIndex="-1"
      className={clsx(commonStyles.fhContainer, styles.reportsContainer)}
    >
      <Helmet>
        <title>AT Interop Reports | ARIA-AT</title>
      </Helmet>
      <KeyMetricsBanner />
      <section className={styles.contentSection}>
        <h1>Assistive Technology Interoperability Reports</h1>
        <h2>Introduction</h2>
        <p>
          This page offers a high-level view of all results which have been
          collected, reviewed and published by the ARIA-AT project. Follow a
          link in the table below to view detailed results.
        </p>

        <Tabs
          tabs={[
            {
              label: 'Test Plans',
              content: (
                <>
                  <h2>Test Plan Support Levels</h2>
                  <p id="support-levels-table-description">
                    The percentage of assertions which passed when each Test
                    Plan was executed by a given Assistive Technology and
                    Browser.
                  </p>
                  <Table
                    bordered
                    responsive
                    aria-label="Test Plan Support Levels"
                  >
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
                      {testPlanVersions.map(testPlanVersion => {
                        const { testPlanReports } = testPlanVersion;
                        const phase = testPlanVersion.phase;
                        return (
                          <tr key={testPlanVersion.id}>
                            <td>
                              <Link
                                to={`/report/${testPlanVersion.id}`}
                                aria-label={`${getTestPlanVersionTitle(
                                  testPlanVersion
                                )}, ${phase} report`}
                              >
                                {getTestPlanVersionTitle(testPlanVersion)}
                              </Link>
                              <span
                                className={clsx(
                                  styles.phaseText,
                                  styles[phase.toLowerCase()]
                                )}
                                aria-hidden
                              >
                                {derivePhaseName(phase)}
                              </span>
                            </td>
                            {Object.values(testPlanTargetsById).map(
                              testPlanTarget => {
                                const testPlanReport = testPlanReports.find(
                                  testPlanReport =>
                                    testPlanReport.at.id ===
                                      testPlanTarget.at.id &&
                                    testPlanReport.browser.id ===
                                      testPlanTarget.browser.id
                                );

                                if (!testPlanReport) {
                                  return (
                                    <td
                                      key={`${testPlanVersion.id}-${testPlanTarget.id}`}
                                    >
                                      {none}
                                    </td>
                                  );
                                }
                                const metrics = testPlanReport.metrics;
                                return (
                                  <td key={testPlanReport.id}>
                                    <Link
                                      to={
                                        `/report/${testPlanVersion.id}` +
                                        `/targets/${testPlanReport.id}`
                                      }
                                      aria-label={`${metrics.supportPercent}%`}
                                    >
                                      <ProgressBar
                                        progress={metrics.supportPercent}
                                      />
                                    </Link>
                                  </td>
                                );
                              }
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              )
            },
            {
              label: 'ARIA Features',
              content: (
                <FeatureSupportTable
                  featureData={ariaHtmlFeaturesMetrics.ariaFeaturesByAtBrowser}
                  featureLabel="ARIA"
                />
              )
            },
            {
              label: 'HTML Features',
              content: (
                <FeatureSupportTable
                  featureData={ariaHtmlFeaturesMetrics.htmlFeaturesByAtBrowser}
                  featureLabel="HTML"
                />
              )
            }
          ]}
        />
      </section>
    </Container>
  );
};

SummarizeTestPlanReports.propTypes = {
  testPlanVersions: PropTypes.arrayOf(TestPlanVersionPropType).isRequired,
  ariaHtmlFeaturesMetrics: PropTypes.object.isRequired
};

export default SummarizeTestPlanReports;
