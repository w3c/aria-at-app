import React from 'react';
import createIssueLink from '@client/utils/createIssueLink';
import { AtOutputPropType } from '../../common/proptypes';
import PropTypes from 'prop-types';
import AssertionsFieldset from '../AssertionsFieldset';
import OutputTextArea from '../OutputTextArea';
import UnexpectedBehaviorsFieldset from '../UnexpectedBehaviorsFieldset';

const CommandResults = ({
  header,
  atOutput,
  assertions,
  unexpectedBehaviors,
  assertionsHeader,
  commonIssueContent,
  commandIndex,
  isSubmitted,
  isReviewingBot,
  isReadOnly
}) => {
  const commandString = header.replace('After ', '');
  const issueLink = createIssueLink({
    ...commonIssueContent,
    commandString
  });

  return (
    <>
      <h3>{header}</h3>
      <OutputTextArea
        commandIndex={commandIndex}
        atOutput={atOutput}
        isSubmitted={isSubmitted}
        readOnly={isReviewingBot || isReadOnly}
      />
      <AssertionsFieldset
        assertions={assertions}
        commandIndex={commandIndex}
        assertionsHeader={assertionsHeader}
        readOnly={isReadOnly}
      />
      <UnexpectedBehaviorsFieldset
        commandIndex={commandIndex}
        unexpectedBehaviors={unexpectedBehaviors}
        isSubmitted={isSubmitted}
        readOnly={isReadOnly}
      />
      <a href={issueLink} target="_blank" rel="noreferrer">
        Raise an issue for {commandString}
      </a>
    </>
  );
};

CommandResults.propTypes = {
  header: PropTypes.string.isRequired,
  atOutput: AtOutputPropType.isRequired,
  assertions: PropTypes.array.isRequired,
  unexpectedBehaviors: PropTypes.object.isRequired,
  assertionsHeader: PropTypes.object.isRequired,
  commonIssueContent: PropTypes.object.isRequired,
  commandIndex: PropTypes.number.isRequired,
  isSubmitted: PropTypes.bool.isRequired,
  isReviewingBot: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool.isRequired
};

export default CommandResults;
