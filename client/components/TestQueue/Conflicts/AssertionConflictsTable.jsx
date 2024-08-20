import React from 'react';
import { ConflictCell, ConflictTable } from './ConflictSummaryTable';
import { UserPropType } from '../../common/proptypes';
import PropTypes from 'prop-types';

const AssertionConflictsTable = ({ conflictingResults, testers }) => {
  const allAssertions =
    conflictingResults[0].scenarioResult.assertionResults.map(
      ar => ar.assertion.text
    );

  return (
    <>
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

            return (
              <tr key={index}>
                <td>{assertion}</td>
                {results.map((result, i) => (
                  <ConflictCell key={i} conflict={hasConflict}>
                    {result ? 'Passed' : 'Failed'}
                  </ConflictCell>
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
