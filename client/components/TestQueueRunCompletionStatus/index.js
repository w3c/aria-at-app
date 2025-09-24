import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPeopleArrows } from '@fortawesome/free-solid-svg-icons';
import { useTestPlanRunValidatedAssertionCounts } from '../../hooks/useTestPlanRunValidatedAssertionCounts';
import AssignTesterDropdown from '../common/AssignTesterDropdown';
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
  tester,
  isAdmin,
  reassignTesters,
  onReassign
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

  const isScenarioResultCompleted = scenarioResult =>
    typeof scenarioResult.output === 'string' && scenarioResult.output !== '';

  const isScenarioResultCompletedRerun = scenarioResult =>
    isScenarioResultCompleted(scenarioResult) &&
    scenarioResult.negativeSideEffects !== null &&
    scenarioResult.assertionResults.every(
      assertionResult => assertionResult.passed !== null
    );

  const getNumCompletedOutputs = result => {
    const isRerun = !!testPlanReport.isRerun;
    return result.scenarioResults.reduce((acc, scenario) => {
      return (
        acc +
        (isRerun
          ? isScenarioResultCompletedRerun(scenario)
          : isScenarioResultCompleted(scenario)
          ? 1
          : 0)
      );
    }, 0);
  };

  // Calculate completed responses
  // Different calculation used for reruns
  const completedResponses = useMemo(
    () =>
      testPlanRun?.testResults?.reduce(
        (acc, result) => acc + getNumCompletedOutputs(result),
        0
      ),
    [testPlanRun?.testResults]
  );

  // Scenarios, even on a runnable test, may have different ATs than the report
  const getNumScenariosTest = test =>
    test.scenarios.reduce(
      (acc, scenario) =>
        acc + (scenario.at.id === testPlanReport.at.id ? 1 : 0),
      0
    );

  const totalResponses = useMemo(
    () =>
      testPlanReport.runnableTests.reduce(
        (acc, test) => acc + getNumScenariosTest(test),
        0
      ),
    [testPlanReport.runnableTests]
  );

  let info;
  let completionStatus;

  if (isBot) {
    info = (
      <span>
        <FontAwesomeIcon icon={faRobot} />
        <span className="sr-only">{username}</span>
      </span>
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
  }

  completionStatus = ` ${completedResponses}/${totalResponses} responses, ${totalValidatedAssertions}/${totalPossibleAssertions} verdicts`;

  return (
    <div
      id={`TestQueueRunCompletionStatus_${rowId}`}
      className={testQueueStyles.completionStatusListItem}
    >
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
    </div>
  );
};

TestQueueRunCompletionStatus.propTypes = {
  rowId: PropTypes.string.isRequired,
  testPlanReport: TestPlanReportPropType.isRequired,
  testPlanRun: TestPlanRunPropType.isRequired,
  tester: UserPropType.isRequired,
  isAdmin: PropTypes.bool,
  reassignTesters: PropTypes.arrayOf(UserPropType),
  onReassign: PropTypes.func
};

export default TestQueueRunCompletionStatus;
