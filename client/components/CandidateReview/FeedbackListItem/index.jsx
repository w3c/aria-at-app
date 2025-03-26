import React from 'react';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faCommentAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './FeedbackListItem.module.css';

export const FeedbackTypeMap = {
  FEEDBACK: 'FEEDBACK',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED'
};

const FeedbackListItem = ({
  issues = [],
  uniqueAuthors = [],
  authorMeIncluded = false,
  feedbackType = FeedbackTypeMap.FEEDBACK,
  isGeneralFeedback = false,
  githubUrl = '#'
}) => {
  let content;
  const hasDifferentAuthors = uniqueAuthors.length > 1;

  const issuesText =
    issues.length === 1 ? 'in 1 issue' : `in ${issues.length} issues`;
  const contextNote = isGeneralFeedback
    ? ` for this test plan ${issuesText}`
    : ` for this test ${issuesText}`;

  if (authorMeIncluded) {
    let feedbackNote = 'You';
    if (hasDifferentAuthors) {
      const othersCount = uniqueAuthors.length - 1;
      const othersText = othersCount === 1 ? 'other' : 'others';
      feedbackNote += ` and ${uniqueAuthors.length - 1} ${othersText}`;
    }
    feedbackNote +=
      feedbackType === FeedbackTypeMap.FEEDBACK
        ? ' left feedback'
        : ' requested changes';

    content = (
      <>
        <a href={githubUrl} target="_blank" rel="noreferrer">
          {feedbackNote}
        </a>
        {contextNote}
      </>
    );
  } else {
    let feedbackNote = `${uniqueAuthors.length}`;
    feedbackNote += ` ${uniqueAuthors.length === 1 ? 'person' : 'people'}`;
    feedbackNote +=
      feedbackType === FeedbackTypeMap.FEEDBACK
        ? ` left feedback`
        : ` requested changes`;

    content = (
      <>
        <a href={githubUrl} target="_blank" rel="noreferrer">
          {feedbackNote}
        </a>
        {contextNote}
      </>
    );
  }

  return (
    <li className={styles.feedbackListItem} key={nextId()}>
      <FontAwesomeIcon
        icon={feedbackType === FeedbackTypeMap.FEEDBACK ? faCommentAlt : faFlag}
        color={
          feedbackType === FeedbackTypeMap.FEEDBACK
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
  uniqueAuthors: PropTypes.arrayOf(PropTypes.string),
  authorMeIncluded: PropTypes.bool,
  issues: PropTypes.array,
  feedbackType: PropTypes.string,
  isGeneralFeedback: PropTypes.bool,
  githubUrl: PropTypes.string
};

export default FeedbackListItem;
