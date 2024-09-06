import React from 'react';
import styled from '@emotion/styled';
import { Button, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationCircle,
  faFileImport
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { TestPlanRunPropType } from '../../common/proptypes';

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

const TestConflictsActions = ({ issueLink, isAdmin, testPlanRuns }) => {
  return (
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
            {testPlanRuns.map(testPlanRun => (
              <Dropdown.Item
                key={testPlanRun.id}
                href={`/run/${testPlanRun.id}?user=${testPlanRun.tester.id}`}
              >
                {testPlanRun.tester.username}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </ActionContainer>
  );
};

TestConflictsActions.propTypes = {
  issueLink: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  testPlanRuns: PropTypes.arrayOf(TestPlanRunPropType).isRequired,
  testIndex: PropTypes.number.isRequired
};

export default TestConflictsActions;
