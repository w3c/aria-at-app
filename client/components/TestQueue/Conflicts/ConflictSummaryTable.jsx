import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { ThemeTable } from '../../common/ThemeTable';
import { IssuePropType } from '../../common/proptypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationCircle,
  faFileImport
} from '@fortawesome/free-solid-svg-icons';
import { Button, Dropdown } from 'react-bootstrap';
import AssertionConflictsTable from './AssertionConflictsTable';
import UnexpectedBehaviorsConflictsTable from './UnexpectedBehaviorsConflictsTable';
import ConflictIssueDetails from './ConflictIssueDetails';

export const ConflictTable = styled(ThemeTable)`
  th,
  td {
    text-align: left;
    padding: 0.75rem;
  }
  margin-bottom: 2rem;
`;

export const ConflictCell = styled.td`
  background-color: ${props => (props.conflict ? '#FFEBEE' : 'inherit')};
  font-weight: ${props => (props.conflict ? 'bold' : 'normal')};
`;

const ActionContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  max-width: 500px;
  & > * {
    flex-grow: 1;
    flex-basis: 0;
    min-width: 0;
  }
`;

const ActionButton = styled(Button)`
  flex-grow: 1;
  flex-basis: 0;
  min-width: 0;
  width: 100%;
  margin: 0;
`;

const ConflictSummaryTable = ({
  conflictingResults,
  issues,
  issueLink,
  isAdmin,
  testIndex
}) => {
  const testers = useMemo(
    () => conflictingResults.map(result => result.testPlanRun.tester.username),
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

  const renderActions = () => (
    <ActionContainer>
      <Button variant="secondary" target="_blank" href={issueLink}>
        <FontAwesomeIcon icon={faExclamationCircle} />
        Raise an Issue for Conflict
      </Button>
      {isAdmin && (
        <Dropdown>
          <Dropdown.Toggle variant="secondary" as={ActionButton}>
            <FontAwesomeIcon icon={faFileImport} />
            Open run as...
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {conflictingResults.map(result => (
              <Dropdown.Item
                key={result.testPlanRun.tester.id}
                href={`/run/${result.testPlanRun.id}?user=${result.testPlanRun.tester.id}#${testIndex}`}
              >
                {result.testPlanRun.tester.username}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </ActionContainer>
  );

  return (
    <>
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
      {issues.length > 0 && <ConflictIssueDetails issues={issues} />}
      {renderActions()}
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
