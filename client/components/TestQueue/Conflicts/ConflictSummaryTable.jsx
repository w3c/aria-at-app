import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { ThemeTable } from '../../common/ThemeTable';

const StyledThemeTable = styled(ThemeTable)`
  th,
  td {
    text-align: left;
    padding: 0.75rem;
  }
  margin-bottom: 2rem;
`;

const ConflictCell = styled.td`
  background-color: ${props => (props.conflict ? '#FFEBEE' : 'inherit')};
  font-weight: ${props => (props.conflict ? 'bold' : 'normal')};
`;

const ConflictSummaryTable = ({ conflictingResults }) => {
  const testers = conflictingResults.map(
    result => result.testPlanRun.tester.username
  );

  const hasAssertionConflicts =
    conflictingResults[0].scenarioResult.assertionResults.some((ar, index) =>
      conflictingResults.some(
        cr => cr.scenarioResult.assertionResults[index].passed !== ar.passed
      )
    );

  const hasUnexpectedBehaviorConflicts = conflictingResults.some(
    result => result.scenarioResult.unexpectedBehaviors.length > 0
  );

  const renderAssertionConflicts = () => {
    const allAssertions =
      conflictingResults[0].scenarioResult.assertionResults.map(
        ar => ar.assertion.text
      );

    return (
      <>
        <StyledThemeTable bordered responsive>
          <thead>
            <tr>
              <th>Assertion</th>
              {testers.map(tester => (
                <th key={tester}>{tester}</th>
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
        </StyledThemeTable>
      </>
    );
  };

  const renderUnexpectedBehaviorConflicts = () => {
    const allUnexpectedBehaviors = Array.from(
      new Set(
        conflictingResults.flatMap(result =>
          result.scenarioResult.unexpectedBehaviors.map(ub => ub.text)
        )
      )
    );

    return (
      <>
        <StyledThemeTable bordered responsive>
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
        </StyledThemeTable>
      </>
    );
  };
  return (
    <>
      {hasAssertionConflicts && renderAssertionConflicts()}
      {hasUnexpectedBehaviorConflicts && renderUnexpectedBehaviorConflicts()}
    </>
  );
};

ConflictSummaryTable.propTypes = {
  conflictingResults: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default ConflictSummaryTable;
