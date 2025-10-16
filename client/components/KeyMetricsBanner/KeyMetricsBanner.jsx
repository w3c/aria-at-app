import React from 'react';
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
    verdictsLast90Count,
    testsCount
  } = keyMetricsQuery?.keyMetrics ?? {};
  return (
    <Alert
      className={styles.keyMetrics}
      variant="primary"
      show={Boolean(keyMetricsQuery)}
    >
      {keyMetricsQuery && (
        <>
          <h2>Today's Testing Snapshot:</h2>{' '}
          <p data-test-id="keyMetrics">
            As of <strong>{new Date(date).toDateString().substring(4)}</strong>,{' '}
            <strong>{verdictsCount.toLocaleString()}</strong> interop verdicts
            for <strong>{commandsCount.toLocaleString()}</strong> AT commands
            across <strong>{testsCount.toLocaleString()}</strong> tests enabled
            by <strong>{contributorsCount.toLocaleString()}</strong>{' '}
            contributors.{' '}
            <strong>{verdictsLast90Count.toLocaleString()}</strong> verdicts
            collected in the last 90 days.
          </p>
        </>
      )}
    </Alert>
  );
};

export default KeyMetricsBanner;
