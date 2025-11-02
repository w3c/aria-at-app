import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import clsx from 'clsx';
import AssertionConflictsTable from './AssertionConflictsTable';
import NegativeSideEffectsConflictsTable from './NegativeSideEffectsConflictsTable';
import styles from './Conflicts.module.css';
import commonStyles from '../../common/styles.module.css';

const ConflictSummaryTable = ({ conflictingResults }) => {
  const commandString = scenario => {
    return `Output for 'After ${scenario.commands
      .map(command => command.text)
      .join(' then ')}'`;
  };

  const testers = useMemo(
    () => conflictingResults.map(result => result.testPlanRun.tester),
    [conflictingResults]
  );

  const hasAssertionConflicts = useMemo(
    () =>
      // If the scenarioResults has 1 in the result group that is untestable,
      // then the expectation is that every result is untestable
      (conflictingResults.some(cr => !!cr.scenarioResult.untestable) &&
        !conflictingResults.every(cr => !!cr.scenarioResult.untestable)) ||
      conflictingResults[0].scenarioResult.assertionResults.some((ar, index) =>
        conflictingResults.some(
          cr => cr.scenarioResult.assertionResults[index].passed !== ar.passed
        )
      ),
    [conflictingResults]
  );

  const hasNegativeSideEffectConflicts = useMemo(
    () =>
      conflictingResults.some(
        result => result.scenarioResult.negativeSideEffects.length > 0
      ),
    [conflictingResults]
  );

  return (
    <>
      <h3 style={{ marginBottom: '1rem' }}>
        {commandString(conflictingResults[0].scenario)}
      </h3>

      <Table
        className={clsx(commonStyles.themeTable, styles.conflicts)}
        bordered
        responsive
      >
        <thead>
          <tr>
            <th>Tester</th>
            <th>Output</th>
            <th>Assistive Technology Version</th>
            <th>Browser Version</th>
          </tr>
        </thead>
        <tbody>
          {testers.map(tester => {
            const conflictingResult = conflictingResults.find(
              cr => cr.testPlanRun.tester.id === tester.id
            );
            return (
              <tr key={tester.username}>
                <td>{tester.username}</td>
                <td>{conflictingResult.scenarioResult.output}</td>
                <td>{conflictingResult.atVersion?.name || 'Not available'}</td>
                <td>
                  {conflictingResult.browserVersion?.name || 'Not available'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {hasAssertionConflicts && (
        <AssertionConflictsTable
          conflictingResults={conflictingResults}
          testers={testers}
        />
      )}
      {hasNegativeSideEffectConflicts && (
        <NegativeSideEffectsConflictsTable
          conflictingResults={conflictingResults}
          testers={testers}
        />
      )}
    </>
  );
};

ConflictSummaryTable.propTypes = {
  conflictingResults: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default ConflictSummaryTable;
