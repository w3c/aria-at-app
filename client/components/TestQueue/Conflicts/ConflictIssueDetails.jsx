import React from 'react';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationCircle,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { IssuePropType } from '../../common/proptypes';
import { dates } from 'shared';

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

const ConflictIssueDetails = ({ issues }) => {
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
              {dates.convertDateToString(issue.createdAt)}
            </IssueValue>
            {issue.closedAt && (
              <>
                <IssueLabel>Closed:</IssueLabel>
                <IssueValue>
                  {dates.convertDateToString(issue.closedAt)}
                </IssueValue>
              </>
            )}
          </IssueGrid>
          <IssueLink
            href={issue.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub&nbsp;
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

ConflictIssueDetails.propTypes = {
  issues: PropTypes.arrayOf(IssuePropType).isRequired
};

export default ConflictIssueDetails;
