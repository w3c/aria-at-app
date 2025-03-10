import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { UserPropType } from '../../common/proptypes';
import styles from './Conflicts.module.css';

const UnexpectedBehaviorsConflictsTable = ({ conflictingResults, testers }) => {
  const commandString = scenario => {
    return `Unexpected Behaviors for 'After ${scenario.commands
      .map(command => command.text)
      .join(' then ')}'`;
  };

  const allUnexpectedBehaviors = useMemo(
    () =>
      Array.from(
        new Set(
          conflictingResults.flatMap(result =>
            result.scenarioResult.unexpectedBehaviors.map(ub => ub.text)
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

      <Table className={styles.conflictsTable} bordered responsive>
        <thead>
          <tr>
            <th>Unexpected Behavior</th>
            {testers.map(tester => (
              <th key={tester.username}>{tester.username}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allUnexpectedBehaviors.map((behaviorText, index) => (
            <tr key={index}>
              <td>{behaviorText}</td>
              {conflictingResults.map((result, i) => {
                const matchingBehavior =
                  result.scenarioResult.unexpectedBehaviors.find(
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

UnexpectedBehaviorsConflictsTable.propTypes = {
  conflictingResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  testers: PropTypes.arrayOf(UserPropType).isRequired
};

export default UnexpectedBehaviorsConflictsTable;
