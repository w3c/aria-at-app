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
`;

const ConflictCell = styled.td`
  background-color: ${props => (props.conflict ? '#FFEBEE' : 'inherit')};
  font-weight: ${props => (props.conflict ? 'bold' : 'normal')};
  color: ${props => (props.conflict ? 'salmon !important' : 'inherit')};
`;

const ConflictSummaryTable = ({ conflictingResults }) => {
  const testers = conflictingResults.map(
    result => result.testPlanRun.tester.username
  );
  const allAssertions =
    conflictingResults[0].scenarioResult.assertionResults.map(
      ar => ar.assertion.text
    );

  console.log(conflictingResults);

  return (
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
  );
};

ConflictSummaryTable.propTypes = {
  conflictingResults: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default ConflictSummaryTable;
