import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './ReportStatusDot.module.css';

export const REPORT_STATUSES = {
  ISSUES: 'issues',
  REPORTS_COMPLETE: 'reports-complete',
  REPORTS_IN_PROGRESS: 'reports-in-progress',
  REPORTS_MISSING: 'reports-missing',
  REPORTS_NOT_STARTED: 'reports-not-started',
  TESTS_CANCELLED: 'tests-cancelled',
  TESTS_COMPLETE: 'tests-complete',
  TESTS_ERROR: 'tests-error',
  TESTS_QUEUED: 'tests-queued',
  TESTS_RUNNING: 'tests-running',
  TESTS_SKIPPED: 'tests-skipped'
};

const ReportStatusDot = ({ status }) => {
  if (!status) return null;
  return <span className={clsx(styles.reportStatusDot, styles[status])}></span>;
};

ReportStatusDot.propTypes = {
  status: PropTypes.string.isRequired
};

export default ReportStatusDot;
