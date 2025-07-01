import React, { useMemo } from 'react';
import createIssueLink from '@client/utils/createIssueLink';
import { AtOutputPropType, UntestablePropType } from '../../common/proptypes';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import AssertionsFieldset from '../AssertionsFieldset';
import OutputTextArea from '../OutputTextArea';
import UnexpectedBehaviorsFieldset from '../UnexpectedBehaviorsFieldset';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import styles from '../TestRenderer.module.css';

let tooltipCount = 0;

const CommandResults = ({
  header,
  atOutput,
  untestable,
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
  const tooltipID = useMemo(() => `untestable-tooltip-${++tooltipCount}`, []);

  return (
    <>
      <h3>{header}</h3>
      <OutputTextArea
        commandIndex={commandIndex}
        atOutput={atOutput}
        isSubmitted={isSubmitted}
        readOnly={isReviewingBot || isReadOnly}
      />

      <Tooltip>
        <TooltipContent>{untestable.description[0]}</TooltipContent>
        <TooltipTrigger asChild>
          <label className={styles.untestableLabel}>
            <input
              type="checkbox"
              onChange={e => untestable.change(e.target.checked)}
              autoFocus={isSubmitted && untestable.focus}
              checked={untestable.value}
              aria-describedby={tooltipID}
            />
            Command is untestable
            {isSubmitted && (
              <span
                className={clsx(
                  styles.testRendererFeedback,
                  styles.space,
                  'required',
                  untestable.description[1].highlightRequired &&
                    'highlight-required'
                )}
              >
                {untestable.description[1].description}
              </span>
            )}
          </label>
        </TooltipTrigger>
      </Tooltip>

      <AssertionsFieldset
        assertions={assertions}
        commandIndex={commandIndex}
        assertionsHeader={assertionsHeader}
        readOnly={isReadOnly}
        disabled={untestable.value}
      />
      <UnexpectedBehaviorsFieldset
        commandIndex={commandIndex}
        unexpectedBehaviors={unexpectedBehaviors}
        isSubmitted={isSubmitted}
        readOnly={isReadOnly}
        forceYes={untestable.value}
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
  untestable: UntestablePropType.isRequired,
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
