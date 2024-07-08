import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTestPlanRunValidatedAssertionCounts } from '../../../hooks/useTestPlanRunValidatedAssertionCounts';

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
  runnableTestsLength: PropTypes.number.isRequired
};

export default BotTestCompletionStatus;
