import React from 'react';
import { useQuery } from '@apollo/client';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import clsx from 'clsx';
import SummarizeTestPlanReports from './SummarizeTestPlanReports';
import PageStatus from '../common/PageStatus';
import { REPORTS_PAGE_QUERY } from './queries';
import KeyMetricsBanner from '../KeyMetricsBanner/KeyMetricsBanner';
import commonStyles from '../common/styles.module.css';
import reportsStyles from './SummarizeTestPlanReports.module.css';

const Reports = () => {
  const { loading, data, error } = useQuery(REPORTS_PAGE_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  if (error) {
    return (
      <PageStatus
        title="AT Interop Reports | ARIA-AT"
        heading="Assistive Technology Interoperability Reports"
        message={error.message}
        isError
      />
    );
  }

  if (loading) {
    return (
      <Container
        id="main"
        as="main"
        tabIndex="-1"
        className={clsx(
          commonStyles.fhContainer,
          reportsStyles.reportsContainer
        )}
      >
        <Helmet>
          <title>Loading - AT Interop Reports | ARIA-AT</title>
        </Helmet>
        <KeyMetricsBanner />
        <section className={clsx(reportsStyles.contentSection)}>
          <h1>Assistive Technology Interoperability Reports</h1>
          <p>Loading...</p>
        </section>
      </Container>
    );
  }

  if (!data) return null;

  return (
    <SummarizeTestPlanReports
      testPlanVersions={data.testPlanVersions.filter(
        testPlanVersion => testPlanVersion.testPlanReports.length
      )}
      ariaHtmlFeaturesMetrics={data.ariaHtmlFeaturesMetrics}
    />
  );
};

export default Reports;
