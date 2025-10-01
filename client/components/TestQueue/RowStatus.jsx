import React from 'react';
import PropTypes from 'prop-types';
import ProgressBar from '../common/ProgressBar';
import ReportStatusSummary from '../common/ReportStatusSummary';
import { useTestPlanReportPercentComplete } from '../../hooks/useTestPlanReportPercentComplete';
import { TestPlanVersionPropType } from '../common/proptypes';

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
  testPlanVersion: TestPlanVersionPropType.isRequired,
  testPlanReport: PropTypes.shape({
    id: PropTypes.string.isRequired,
    percentComplete: PropTypes.number
  }).isRequired,
  shouldPoll: PropTypes.bool
};

export default RowStatus;
