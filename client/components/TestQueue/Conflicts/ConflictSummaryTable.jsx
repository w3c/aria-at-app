import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { ThemeTable } from '../../common/ThemeTable';
import { IssuePropType } from '../../common/proptypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationCircle,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';

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

const IssuesContainer = styled.div`
  margin-bottom: 2rem;
`;

const IssueContainer = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
`;

const IssueHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const IssueTitle = styled.h4`
  margin: 0;
  margin-left: 0.5rem;
  flex-grow: 1;
`;

const IssueGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
`;

const IssueLabel = styled.span`
  font-weight: bold;
`;

const IssueValue = styled.span`
  word-break: break-word;
`;

const IssueLink = styled.a`
  color: #0366d6;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  margin-top: 0.5rem;
  &:hover {
    text-decoration: underline;
  }
`;

const ConflictSummaryTable = ({ conflictingResults, issues }) => {
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

  const renderIssues = () => {
    if (!issues || issues.length === 0) return null;

    return (
      <IssuesContainer>
        <h3>Related GitHub Issues</h3>
        {issues.map((issue, index) => (
          <IssueContainer key={index}>
            <IssueHeader>
              <FontAwesomeIcon
                icon={faExclamationCircle}
                style={{ color: issue.isOpen ? '#28a745' : '#6a737d' }}
              />
              <IssueTitle>{issue.title}</IssueTitle>
            </IssueHeader>
            <IssueGrid>
              <IssueLabel>Status:</IssueLabel>
              <IssueValue>{issue.isOpen ? 'Open' : 'Closed'}</IssueValue>
              <IssueLabel>Author:</IssueLabel>
              <IssueValue>{issue.author}</IssueValue>
              <IssueLabel>Type:</IssueLabel>
              <IssueValue>{issue.feedbackType}</IssueValue>
              <IssueLabel>Created:</IssueLabel>
              <IssueValue>
                {new Date(issue.createdAt).toLocaleDateString()}
              </IssueValue>
              {issue.closedAt && (
                <>
                  <IssueLabel>Closed:</IssueLabel>
                  <IssueValue>
                    {new Date(issue.closedAt).toLocaleDateString()}
                  </IssueValue>
                </>
              )}
            </IssueGrid>
            <IssueLink
              href={issue.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub{' '}
              <FontAwesomeIcon
                icon={faExternalLinkAlt}
                size="sm"
                style={{ marginLeft: '0.25rem' }}
              />
            </IssueLink>
          </IssueContainer>
        ))}
      </IssuesContainer>
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
      {renderIssues()}
    </>
  );
};

ConflictSummaryTable.propTypes = {
  conflictingResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  issues: PropTypes.arrayOf(IssuePropType).isRequired
};

export default ConflictSummaryTable;
