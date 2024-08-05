import React, { useState } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  font-size: 1rem;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  background: #f7f7f7;

  border: 2px solid #d3d5d9;
  border-radius: 0.5rem;

  details {
    font-weight: normal;
    font-size: 1rem;

    span > ol {
      margin-bottom: 0;
    }

    summary {
      width: fit-content;

      list-style: none;

      font-weight: bold;
      text-align: left;
      border: thin solid transparent;
      background-color: transparent;

      :hover,
      :focus {
        background-color: #eee;
      }

      ::-webkit-details-marker {
        display: none;
      }
    }
  }
`;

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
    <Container>
      <details>
        <summary
          id="disclaimer-title"
          aria-expanded={expanded}
          aria-controls="description"
          onClick={() => setExpanded(!expanded)}
          aria-label={`Warning! ${title}`}
        >
          <FontAwesomeIcon
            icon={faExclamationCircle}
            color="#94979b"
            size="lg"
            aria-hidden={true}
          />
          {title}
        </summary>
        {messageContent}
      </details>
    </Container>
  );
};

DisclaimerInfo.propTypes = {
  phase: PropTypes.string
};

export default DisclaimerInfo;
