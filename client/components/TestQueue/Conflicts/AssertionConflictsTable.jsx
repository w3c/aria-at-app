import React from 'react';
import { ConflictTable } from './ConflictSummaryTable';
import { UserPropType } from '../../common/proptypes';
import PropTypes from 'prop-types';

const AssertionConflictsTable = ({ conflictingResults, testers }) => {
  const commandString = scenario => {
    return `Assertions for 'After ${scenario.commands
      .map(command => command.text)
      .join(' then ')}'`;
  };

  const allAssertions =
    conflictingResults[0].scenarioResult.assertionResults.map(
      ar => ar.assertion.text
    );

  return (
    <>
      <h3 style={{ marginBottom: '1rem' }}>
        {commandString(conflictingResults[0].scenario)}
      </h3>

      <ConflictTable bordered responsive>
        <thead>
          <tr>
            <th>Assertion</th>
            {testers.map(tester => (
              <th key={tester.username}>{tester.username}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allAssertions.map((assertion, index) => {
            const results = conflictingResults.map(
              cr => cr.scenarioResult.assertionResults[index].passed
            );
            const hasConflict = results.some(r => r !== results[0]);
            if (!hasConflict) {
              return null;
            }
            return (
              <tr key={index}>
                <td>{assertion}</td>
                {results.map((result, i) => (
                  <td key={i}>{result ? 'Passed' : 'Failed'}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </ConflictTable>
    </>
  );
};

AssertionConflictsTable.propTypes = {
  conflictingResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  testers: PropTypes.arrayOf(UserPropType).isRequired
};

export default AssertionConflictsTable;
