import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { ThemeTable } from '../../common/ThemeTable';
import { IssuePropType } from '../../common/proptypes';
import AssertionConflictsTable from './AssertionConflictsTable';
import UnexpectedBehaviorsConflictsTable from './UnexpectedBehaviorsConflictsTable';

export const ConflictTable = styled(ThemeTable)`
  th,
  td {
    text-align: left;
    padding: 0.75rem;
  }
  margin-bottom: 2rem;
`;

const ConflictSummaryTable = ({ conflictingResults }) => {
  const commandString = scenario => {
    return `After '${scenario.commands
      .map(command => command.text)
      .join(', then ')}'`;
  };

  const testers = useMemo(
    () => conflictingResults.map(result => result.testPlanRun.tester),
    [conflictingResults]
  );

  const hasAssertionConflicts = useMemo(
    () =>
      conflictingResults[0].scenarioResult.assertionResults.some((ar, index) =>
        conflictingResults.some(
          cr => cr.scenarioResult.assertionResults[index].passed !== ar.passed
        )
      ),
    [conflictingResults]
  );

  const hasUnexpectedBehaviorConflicts = useMemo(
    () =>
      conflictingResults.some(
        result => result.scenarioResult.unexpectedBehaviors.length > 0
      ),
    [conflictingResults]
  );

  return (
    <>
      <h3 style={{ marginBottom: '1rem' }}>
        {commandString(conflictingResults[0].scenario)}
      </h3>

      <ConflictTable bordered responsive>
        <thead>
          <tr>
            <th>Tester</th>
            <th>Output</th>
          </tr>
        </thead>
        <tbody>
          {testers.map(tester => (
            <tr key={tester.username}>
              <td>{tester.username}</td>
              <td>
                {
                  conflictingResults.find(
                    cr => cr.testPlanRun.tester.id === tester.id
                  ).scenarioResult.output
                }
              </td>
            </tr>
          ))}
        </tbody>
      </ConflictTable>

      {hasAssertionConflicts && (
        <AssertionConflictsTable
          conflictingResults={conflictingResults}
          testers={testers}
        />
      )}
      {hasUnexpectedBehaviorConflicts && (
        <UnexpectedBehaviorsConflictsTable
          conflictingResults={conflictingResults}
          testers={testers}
        />
      )}
    </>
  );
};

ConflictSummaryTable.propTypes = {
  conflictingResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  issues: PropTypes.arrayOf(IssuePropType).isRequired,
  issueLink: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  testIndex: PropTypes.number.isRequired
};

export default ConflictSummaryTable;
