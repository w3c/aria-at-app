import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './DisclaimerInfo.module.css';

const candidateTitle = 'Unapproved Report';
const candidateMessageContent = (
  <>
    The information in this report is generated from candidate tests. Candidate
    ARIA-AT tests are in review by assistive technology developers and lack
    consensus regarding:
    <ol>
      <li>applicability and validity of the tests, and</li>
      <li>accuracy of test results.</li>
    </ol>
  </>
);

const recommendedTitle = 'Approved Report';
const recommendedMessageContent = (
  <>
    The information in this report is generated from recommended tests.
    Recommended ARIA-AT tests have been reviewed by assistive technology
    developers and represent consensus regarding: applicability and validity of
    the tests, and accuracy of test results.
  </>
);

const deprecatedTitle = 'Deprecated Report';
const deprecatedMessageContent = (
  <>
    The information in this report is generated from previously set candidate or
    recommended tests.
  </>
);

const content = {
  CANDIDATE: {
    title: candidateTitle,
    messageContent: candidateMessageContent
  },
  RECOMMENDED: {
    title: recommendedTitle,
    messageContent: recommendedMessageContent
  },
  DEPRECATED: {
    title: deprecatedTitle,
    messageContent: deprecatedMessageContent
  }
};

const DisclaimerInfo = ({ phase }) => {
  const [expanded, setExpanded] = useState(false);

  const title = content[phase]?.title || content.CANDIDATE.title;
  const messageContent =
    content[phase]?.messageContent || content.CANDIDATE.messageContent;

  return (
    <div className={styles.disclaimerInfoContainer}>
      <details>
        <summary
          aria-expanded={expanded}
          aria-controls="description"
          onClick={() => setExpanded(!expanded)}
          aria-label={title}
        >
          <FontAwesomeIcon
            icon={faExclamationCircle}
            color="var(--bg-dark-gray)"
            size="lg"
            aria-hidden={true}
          />
          {title}
        </summary>
        {messageContent}
      </details>
    </div>
  );
};

DisclaimerInfo.propTypes = {
  phase: PropTypes.string
};

export default DisclaimerInfo;
