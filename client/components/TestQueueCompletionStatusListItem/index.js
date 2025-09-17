import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPeopleArrows } from '@fortawesome/free-solid-svg-icons';
import BotTestCompletionStatus from './BotTestCompletionStatus';
import PreviouslyAutomatedTestCompletionStatus from './PreviouslyAutomatedTestCompletionStatus';
import AssignTesterDropdown from '../common/AssignTesterDropdown';
import {
  TestPlanReportPropType,
  TestPlanRunPropType,
  UserPropType
} from '../common/proptypes';
import testQueueStyles from '../TestQueue/TestQueue.module.css';

const TestQueueCompletionStatusListItem = ({
  rowId,
  testPlanReport,
  testPlanRun,
  tester,
  isAdmin,
  reassignTesters,
  onReassign
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
    <li className={testQueueStyles.completionStatusListItem}>
      <div className={testQueueStyles.testerInfo}>
        {info}
        {isAdmin && !isBot && reassignTesters?.length > 0 && (
          <AssignTesterDropdown
            testPlanReportId={testPlanReport.id}
            testPlanRun={testPlanRun}
            possibleTesters={reassignTesters}
            onChange={onReassign}
            srLabel="Reassign Tester"
            faAssignIcon={faPeopleArrows}
          />
        )}
      </div>
      {completionStatus}
    </li>
  );
};

TestQueueCompletionStatusListItem.propTypes = {
  rowId: PropTypes.string.isRequired,
  testPlanReport: TestPlanReportPropType.isRequired,
  testPlanRun: TestPlanRunPropType.isRequired,
  tester: UserPropType.isRequired,
  isAdmin: PropTypes.bool,
  reassignTesters: PropTypes.arrayOf(UserPropType),
  onReassign: PropTypes.func
};

export default TestQueueCompletionStatusListItem;
