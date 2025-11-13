import React from 'react';
import PropTypes from 'prop-types';
import ProgressBar from '../common/ProgressBar';
import ReportStatusSummary from '../common/ReportStatusSummary';
import { useTestPlanReportPercentComplete } from '../../hooks/useTestPlanReportPercentComplete';

const RowStatus = ({ testPlanVersion, testPlanReport, shouldPoll }) => {
  const { percentComplete } = useTestPlanReportPercentComplete(
    testPlanReport.id,
    shouldPoll ? 2000 : null
  );

  const progress =
    typeof percentComplete === 'number'
      ? percentComplete
      : testPlanReport.percentComplete || 0;

  return (
    <>
      <ProgressBar progress={progress} decorative />
      <ReportStatusSummary
        testPlanVersion={testPlanVersion}
        testPlanReport={{ ...testPlanReport, percentComplete: progress }}
        fromTestQueue
      />
    </>
  );
};

RowStatus.propTypes = {
  testPlanVersion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    phase: PropTypes.string,
    versionString: PropTypes.string
  }).isRequired,
  testPlanReport: PropTypes.shape({
    id: PropTypes.string.isRequired,
    percentComplete: PropTypes.number,
    markedFinalAt: PropTypes.string,
    conflictsLength: PropTypes.number,
    draftTestPlanRuns: PropTypes.arrayOf(
      PropTypes.shape({
        tester: PropTypes.shape({
          username: PropTypes.string
        })
      })
    )
  }).isRequired,
  shouldPoll: PropTypes.bool
};

export default RowStatus;
