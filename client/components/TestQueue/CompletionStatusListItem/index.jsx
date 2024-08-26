import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import BotTestCompletionStatus from '@components/TestQueueCompletionStatusListItem/BotTestCompletionStatus';
import PreviouslyAutomatedTestCompletionStatus from '@components/TestQueueCompletionStatusListItem/PreviouslyAutomatedTestCompletionStatus';
import {
  TestPlanReportPropType,
  TestPlanRunPropType,
  UserPropType
} from '../../common/proptypes';

const CompletionStatusListItem = ({
  rowId,
  testPlanReport,
  testPlanRun,
  tester
}) => {
  const { username, isBot } = tester;
  const testPlanRunPreviouslyAutomated = useMemo(
    () => testPlanRun.initiatedByAutomation,
    [testPlanRun]
  );

  let info;
  let completionStatus;

  if (isBot) {
    info = (
      <span>
        <FontAwesomeIcon icon={faRobot} />
        {username}
      </span>
    );
    completionStatus = (
      <BotTestCompletionStatus
        id={`BotTestCompletionStatus_${rowId}`}
        testPlanRun={testPlanRun}
        runnableTestsLength={testPlanReport.runnableTestsLength}
      />
    );
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

    completionStatus = testPlanRunPreviouslyAutomated ? (
      <PreviouslyAutomatedTestCompletionStatus
        id={`PreviouslyAutomatedTestCompletionStatus_${rowId}`}
        testPlanRunId={testPlanRun.id}
        runnableTestsLength={testPlanReport.runnableTestsLength}
      />
    ) : (
      <em>
        {`${testPlanRun.testResultsLength} of ` +
          `${testPlanReport.runnableTestsLength} tests complete`}
      </em>
    );
  }

  return (
    <li>
      {info}
      {completionStatus}
    </li>
  );
};

CompletionStatusListItem.propTypes = {
  rowId: PropTypes.string.isRequired,
  testPlanReport: TestPlanReportPropType.isRequired,
  testPlanRun: TestPlanRunPropType.isRequired,
  tester: UserPropType.isRequired
};

export default CompletionStatusListItem;
