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

  const getNumCompletedOutputs = result =>
    result.scenarioResults.reduce((acc, scenario) => {
      return (
        acc +
        (typeof scenario.output === 'string' && scenario.output !== '' ? 1 : 0)
      );
    }, 0);

  // Calculate completed responses (number of commands with outputs)
  const completedResponses = testPlanRun?.testResults?.reduce(
    (acc, result) => acc + getNumCompletedOutputs(result),
    0
  );

  // Scenarios, even on a runnable test, may have different ATs than the report
  const getNumScenariosTest = test =>
    test.scenarios.reduce(
      (acc, scenario) =>
        acc + (scenario.at.id === testPlanReport.at.id ? 1 : 0),
      0
    );

  const totalResponses = testPlanReport.runnableTests.reduce(
    (acc, test) => acc + getNumScenariosTest(test),
    0
  );

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
