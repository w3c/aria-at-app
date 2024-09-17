import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { dates } from 'shared';
import { calculatePercentComplete } from '../../../utils/calculatePercentComplete';
import {
  TestPlanVersionPropType,
  TestPlanRunPropType,
  UserPropType
} from '../proptypes';

const IncompleteStatusReport = styled.span`
  min-width: 5rem;
  display: inline-block;
`;

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
    return (
      <a
        style={{ color: '#ce1b4c' }}
        href={`/test-queue/${testPlanReport.id}/conflicts`}
      >
        with {conflictsCount} conflicts
      </a>
    );
  };

  const renderPartialCompleteReportStatus = testPlanReport => {
    const { metrics, draftTestPlanRuns } = testPlanReport;

    const conflictsCount = metrics.conflictsCount ?? 0;
    const percentComplete = calculatePercentComplete(testPlanReport);
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
            {percentComplete}% complete by&nbsp;
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
            {percentComplete}% complete by&nbsp;
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

  return <IncompleteStatusReport>Missing</IncompleteStatusReport>;
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
