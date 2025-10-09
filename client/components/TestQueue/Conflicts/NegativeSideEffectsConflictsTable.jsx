import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { UserPropType } from '../../common/proptypes';
import styles from './Conflicts.module.css';

const NegativeSideEffectsConflictsTable = ({ conflictingResults, testers }) => {
  const commandString = scenario => {
    return `Negative Side Effects for 'After ${scenario.commands
      .map(command => command.text)
      .join(' then ')}'`;
  };

  const allNegativeSideEffects = useMemo(
    () =>
      Array.from(
        new Set(
          conflictingResults.flatMap(result =>
            (result.scenarioResult.negativeSideEffects || []).map(ub => ub.text)
          )
        )
      ),
    [conflictingResults]
  );

  return (
    <>
      <h3 style={{ marginBottom: '1rem' }}>
        {commandString(conflictingResults[0].scenario)}
      </h3>

      <Table className={styles.conflicts} bordered responsive>
        <thead>
          <tr>
            <th>Negative Side Effect</th>
            {testers.map(tester => (
              <th key={tester.username}>{tester.username}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allNegativeSideEffects.map((behaviorText, index) => (
            <tr key={index}>
              <td>{behaviorText}</td>
              {conflictingResults.map((result, i) => {
                const matchingBehavior =
                  result.scenarioResult.negativeSideEffects.find(
                    ub => ub.text === behaviorText
                  );
                return (
                  <td key={i}>
                    {matchingBehavior ? (
                      <>
                        Impact: {matchingBehavior.impact}
                        <br />
                        Details: {matchingBehavior.details}
                      </>
                    ) : (
                      'Not reported'
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

NegativeSideEffectsConflictsTable.propTypes = {
  conflictingResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  testers: PropTypes.arrayOf(UserPropType).isRequired
};

export default NegativeSideEffectsConflictsTable;
