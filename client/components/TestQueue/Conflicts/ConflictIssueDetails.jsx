import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationCircle,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { IssuePropType } from '../../common/proptypes';
import { dates } from 'shared';
import styles from './Conflicts.module.css';
import commonStyles from '@components/common/styles.module.css';

const ConflictIssueDetails = ({ issues }) => {
  if (!issues || issues.length === 0) return null;

  return (
    <div>
      <h3>Related GitHub Issues</h3>
      {issues.map((issue, index) => (
        <div className={styles.conflictIssueContainer} key={index}>
          <div className={styles.conflictIssueHeaderContainer}>
            <FontAwesomeIcon
              icon={faExclamationCircle}
              style={{
                color: issue.isOpen
                  ? 'var(--positive-green)'
                  : 'var(--negative-gray)'
              }}
            />
            <h4 className={styles.conflictIssueHeader}>{issue.title}</h4>
          </div>
          <div className={styles.conflictIssueGrid}>
            <span className={commonStyles.boldFont}>Status:</span>
            <span className={styles.conflictIssueValue}>
              {issue.isOpen ? 'Open' : 'Closed'}
            </span>
            <span className={commonStyles.boldFont}>Author:</span>
            <span className={styles.conflictIssueValue}>{issue.author}</span>
            <span className={commonStyles.boldFont}>Type:</span>
            <span className={styles.conflictIssueValue}>
              {issue.feedbackType}
            </span>
            <span className={commonStyles.boldFont}>Created:</span>
            <span className={styles.conflictIssueValue}>
              {dates.convertDateToString(issue.createdAt)}
            </span>
            {issue.closedAt && (
              <>
                <span className={commonStyles.boldFont}>Closed:</span>
                <span className={styles.conflictIssueValue}>
                  {dates.convertDateToString(issue.closedAt)}
                </span>
              </>
            )}
          </div>
          <a
            href={issue.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.conflictIssueLink}
          >
            View on GitHub&nbsp;
            <FontAwesomeIcon
              icon={faExternalLinkAlt}
              size="sm"
              style={{ marginLeft: '0.25rem' }}
            />
          </a>
        </div>
      ))}
    </div>
  );
};

ConflictIssueDetails.propTypes = {
  issues: PropTypes.arrayOf(IssuePropType).isRequired
};

export default ConflictIssueDetails;
