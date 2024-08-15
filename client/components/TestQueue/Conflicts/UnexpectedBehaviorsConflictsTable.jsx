import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { ConflictCell, ConflictTable } from './ConflictSummaryTable';
import { UserPropType } from '../../common/proptypes';

const UnexpectedBehaviorsConflictsTable = ({ conflictingResults, testers }) => {
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
      <ConflictTable bordered responsive>
        <thead>
          <tr>
            <th>Unexpected Behavior</th>
            {testers.map(tester => (
              <th key={tester}>{tester}</th>
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
                const hasConflict = !matchingBehavior;
                return (
                  <ConflictCell key={i} conflict={hasConflict}>
                    {matchingBehavior ? (
                      <>
                        Impact: {matchingBehavior.impact}
                        <br />
                        Details: {matchingBehavior.details}
                      </>
                    ) : (
                      'Not reported'
                    )}
                  </ConflictCell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </ConflictTable>
    </>
  );
};

UnexpectedBehaviorsConflictsTable.propTypes = {
  conflictingResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  testers: PropTypes.arrayOf(UserPropType).isRequired
};

export default UnexpectedBehaviorsConflictsTable;
