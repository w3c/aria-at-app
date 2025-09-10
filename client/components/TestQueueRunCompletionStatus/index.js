import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { useTestPlanRunValidatedAssertionCounts } from '../../hooks/useTestPlanRunValidatedAssertionCounts';
import {
  TestPlanReportPropType,
  TestPlanRunPropType,
  UserPropType
} from '../common/proptypes';
import testQueueStyles from '../TestQueue/TestQueue.module.css';

const TestQueueRunCompletionStatus = ({
  rowId,
  testPlanReport,
  testPlanRun,
  tester
}) => {
  const { username, isBot } = tester;

  const {
    totalValidatedAssertions,
    totalPossibleAssertions,
    testResultsLength,
    stopPolling
  } = useTestPlanRunValidatedAssertionCounts(
    testPlanRun,
    tester?.isBot ? 2000 : null
  );

  useEffect(() => {
    if (
      tester?.isBot &&
      testResultsLength === testPlanReport.runnableTestsLength
    ) {
      stopPolling();
    }
  }, [
    testResultsLength,
    stopPolling,
    tester?.isBot,
    testPlanReport.runnableTestsLength
  ]);

  // Calculate completed responses (tests with completedAt aka submitted tests)
  const completedResponses =
    testPlanRun?.testResults?.reduce(
      (acc, test) => acc + (test.completedAt ? 1 : 0),
      0
    ) || 0;

  const totalResponses = testPlanReport.runnableTestsLength;

  let info;
  let completionStatus;

  if (isBot) {
    info = <FontAwesomeIcon icon={faRobot} aria-label={username} />;
  } else {
    info = (
      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {username}
      </a>
    );
  }

  completionStatus = ` ${completedResponses}/${totalResponses} responses, ${totalValidatedAssertions}/${totalPossibleAssertions} verdicts`;

  return (
    <div
      id={`TestQueueRunCompletionStatus_${rowId}`}
      className={testQueueStyles.completionStatusListItem}
    >
      {info}
      {completionStatus}
    </div>
  );
};

TestQueueRunCompletionStatus.propTypes = {
  rowId: PropTypes.string.isRequired,
  testPlanReport: TestPlanReportPropType.isRequired,
  testPlanRun: TestPlanRunPropType.isRequired,
  tester: UserPropType.isRequired
};

export default TestQueueRunCompletionStatus;
