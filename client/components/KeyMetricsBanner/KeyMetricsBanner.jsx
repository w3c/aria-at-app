import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { KEY_METRICS_QUERY } from './queries';
import { useQuery } from '@apollo/client';
import styles from './KeyMetricsBanner.module.css';

const KeyMetricsBanner = () => {
  const { data: keyMetricsQuery } = useQuery(KEY_METRICS_QUERY);
  const {
    date,
    verdictsCount,
    commandsCount,
    contributorsCount,
    verdictsLast90Count
  } = keyMetricsQuery?.keyMetrics ?? {};
  return (
    <Alert
      className={styles.keyMetrics}
      variant="primary"
      show={keyMetricsQuery}
      //   onClose={() => setShowBanner(false)}
      //   dismissible
    >
      {keyMetricsQuery && (
        <>
          As of <strong>{new Date(date).toDateString().substring(4)}</strong>,{' '}
          <strong>{verdictsCount.toLocaleString()}</strong> interop verdicts for{' '}
          <strong>{commandsCount.toLocaleString()}</strong> AT commands enabled
          by <strong>{contributorsCount.toLocaleString()}</strong> contributors,{' '}
          <strong>{verdictsLast90Count.toLocaleString()}</strong> verdicts in
          the last 90 days.
        </>
      )}
    </Alert>
  );
};

export default KeyMetricsBanner;
