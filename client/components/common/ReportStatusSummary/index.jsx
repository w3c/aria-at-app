import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { dates } from 'shared';

import {
  TestPlanVersionPropType,
  TestPlanRunPropType,
  UserPropType
} from '../proptypes';
import styles from './ReportStatusSummary.module.css';

const ReportStatusSummary = ({
  testPlanVersion,
  testPlanReport,
  fromTestQueue = false
}) => {
  const renderCompleteReportStatus = testPlanReport => {
    const formattedDate = dates.convertDateToString(
      testPlanReport.markedFinalAt,
      'MMM D, YYYY'
    );
    return (
      <a href={`/report/${testPlanVersion.id}/targets/${testPlanReport.id}`}>
        Report completed on <strong>{formattedDate}</strong>
      </a>
    );
  };

  const getConflictsAnchor = conflictsCount => {
    if (conflictsCount === 0) return null;
    const conflictsText = `conflict${conflictsCount === 1 ? '' : 's'}`;
    return (
      <a
        style={{ color: '#ce1b4c' }}
        href={`/test-queue/${testPlanReport.id}/conflicts`}
      >
        with {conflictsCount} {conflictsText}
      </a>
    );
  };

  const renderPartialCompleteReportStatus = testPlanReport => {
    const { metrics, draftTestPlanRuns } = testPlanReport;

    const conflictsCount = metrics.conflictsCount ?? 0;
    switch (draftTestPlanRuns?.length) {
      case 0:
        return fromTestQueue ? (
          <span>No testers assigned</span>
        ) : (
          <span>In test queue with no testers assigned</span>
        );
      case 1:
        return (
          <span>
            {testPlanReport.percentComplete || 0}% complete by&nbsp;
            <a
              href={`https://github.com/${draftTestPlanRuns[0].tester.username}`}
            >
              {draftTestPlanRuns[0].tester.username}
            </a>
            &nbsp;
            {getConflictsAnchor(conflictsCount)}
          </span>
        );
      default:
        return (
          <span>
            {testPlanReport.percentComplete || 0}% complete by&nbsp;
            {draftTestPlanRuns.length} testers&nbsp;
            {getConflictsAnchor(conflictsCount)}
          </span>
        );
    }
  };

  if (testPlanReport) {
    const { markedFinalAt } = testPlanReport;
    if (markedFinalAt) {
      return renderCompleteReportStatus(testPlanReport);
    } else {
      return renderPartialCompleteReportStatus(testPlanReport);
    }
  }

  return <span className={styles.incompleteStatusReport}>Missing</span>;
};

ReportStatusSummary.propTypes = {
  testPlanVersion: TestPlanVersionPropType.isRequired,
  testPlanReport: PropTypes.shape({
    id: PropTypes.string.isRequired,
    markedFinalAt: PropTypes.string,
    metrics: PropTypes.object,
    draftTestPlanRuns: PropTypes.arrayOf(TestPlanRunPropType).isRequired
  }),
  me: UserPropType,
  fromTestQueue: PropTypes.bool
};

export default ReportStatusSummary;
