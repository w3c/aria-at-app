import React from 'react';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faCommentAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './FeedbackListItem.module.css';

const FeedbackListItem = ({
  differentAuthors = false,
  type = 'feedback',
  issues = [],
  individualTest = false,
  githubUrl = '#'
}) => {
  let content;

  if (!differentAuthors && !individualTest) {
    content = (
      <span>
        {`You ${
          type === 'feedback' ? 'left feedback for' : 'requested changes for'
        }`}
        <a href={githubUrl} target="_blank" rel="noreferrer">
          {issues.length} {issues.length === 1 ? 'test' : 'tests'}
        </a>{' '}
        in this Test Plan
      </span>
    );
  } else if (!differentAuthors && individualTest) {
    githubUrl = issues[0].link;
    content = (
      <>
        You{' '}
        <a href={githubUrl} target="_blank" rel="noreferrer">
          {type === 'feedback' ? 'left feedback' : 'requested changes'}
        </a>{' '}
        for this test.
      </>
    );
  } else {
    content = (
      <>
        <a href={githubUrl} target="_blank" rel="noreferrer">
          {issues.length} {issues.length === 1 ? 'person' : 'people'}{' '}
          {type === 'feedback' ? 'left feedback' : 'requested changes'}
        </a>
        {' for this test'}
      </>
    );
  }

  return (
    <li className={styles.feedbackListItem} key={nextId()}>
      <FontAwesomeIcon
        icon={type === 'feedback' ? faCommentAlt : faFlag}
        color={
          type === 'feedback'
            ? 'var(--candidate-feedback)'
            : 'var(--candidate-changes-requested)'
        }
      />
      {content}
      <span className={styles.feedbackIndicator} title="Feedback Indicator" />
    </li>
  );
};

FeedbackListItem.propTypes = {
  differentAuthors: PropTypes.bool,
  issues: PropTypes.array,
  type: PropTypes.string,
  individualTest: PropTypes.bool,
  githubUrl: PropTypes.string
};

export default FeedbackListItem;
