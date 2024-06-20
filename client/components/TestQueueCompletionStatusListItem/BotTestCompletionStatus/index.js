import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTestPlanRunValidatedAssertionCounts } from '../../../hooks/useTestPlanRunValidatedAssertionCounts';

const BotTestCompletionStatus = ({
  testPlanRun,
  id,
  runnableTestsLength,
  fromTestQueueV2 = false // TODO: Remove when Test Queue v1 is removed
}) => {
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
      {fromTestQueueV2 ? (
        <ul id={id} style={{ fontSize: '0.875rem' }}>
          <li>
            <em>{`Responses for ${testResultsLength} of ${runnableTestsLength} tests recorded`}</em>
          </li>
          <li>
            <em>{`Verdicts for ${totalValidatedAssertions} of ${totalPossibleAssertions} assertions assigned`}</em>
          </li>
        </ul>
      ) : (
        <ul id={id} className="text-secondary">
          <li>
            {`Responses for ${testResultsLength} of ${runnableTestsLength} tests recorded`}
          </li>
          <li>
            {`Verdicts for ${totalValidatedAssertions} of ${totalPossibleAssertions} assertions assigned`}
          </li>
        </ul>
      )}
    </>
  );
};

BotTestCompletionStatus.propTypes = {
  testPlanRun: PropTypes.shape({
    id: PropTypes.string.isRequired,
    testResults: PropTypes.arrayOf(
      PropTypes.shape({
        scenarioResults: PropTypes.arrayOf(
          PropTypes.shape({
            assertionResults: PropTypes.arrayOf(
              PropTypes.shape({
                passed: PropTypes.bool
              })
            )
          })
        )
      })
    )
  }).isRequired,
  id: PropTypes.string.isRequired,
  runnableTestsLength: PropTypes.number.isRequired,
  fromTestQueueV2: PropTypes.bool
};

export default BotTestCompletionStatus;
