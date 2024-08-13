import React from 'react';
import PropTypes from 'prop-types';

const ConflictSummaryTable = ({ conflictingResults }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Tester</th>
          <th>Assertion</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        {conflictingResults.map((result, index) =>
          result.scenarioResult.assertionResults.map(
            (assertionResult, assertionIndex) => (
              <tr key={`${index}-${assertionIndex}`}>
                <td>{result.testPlanRun.tester.username}</td>
                <td>{assertionResult.assertion.text}</td>
                <td>{assertionResult.passed ? 'Passed' : 'Failed'}</td>
              </tr>
            )
          )
        )}
      </tbody>
    </table>
  );
};

ConflictSummaryTable.propTypes = {
  conflictingResults: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default ConflictSummaryTable;
