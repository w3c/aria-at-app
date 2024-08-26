import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTestPlanRunValidatedAssertionCounts } from '../../../hooks/useTestPlanRunValidatedAssertionCounts';
import { TestPlanRunPropType } from '../../common/proptypes';

const BotTestCompletionStatus = ({ testPlanRun, id, runnableTestsLength }) => {
  const {
    totalValidatedAssertions,
    totalPossibleAssertions,
    testResultsLength,
    stopPolling
  } = useTestPlanRunValidatedAssertionCounts(testPlanRun, 2000);

  useEffect(() => {
    if (testResultsLength === runnableTestsLength) {
      stopPolling();
    }
  }, [testResultsLength, stopPolling]);

  return (
    <>
      <ul id={id} style={{ fontSize: '0.875rem' }}>
        <li>
          <em>{`Responses for ${testResultsLength} of ${runnableTestsLength} tests recorded`}</em>
        </li>
        <li>
          <em>{`Verdicts for ${totalValidatedAssertions} of ${totalPossibleAssertions} assertions assigned`}</em>
        </li>
      </ul>
    </>
  );
};

BotTestCompletionStatus.propTypes = {
  testPlanRun: TestPlanRunPropType.isRequired,
  id: PropTypes.string.isRequired,
  runnableTestsLength: PropTypes.number.isRequired
};

export default BotTestCompletionStatus;
