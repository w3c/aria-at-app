import React, { useMemo } from 'react';
import createIssueLink from '@client/utils/createIssueLink';
import { AtOutputPropType, UntestablePropType } from '../../common/proptypes';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import AssertionsFieldset from '../AssertionsFieldset';
import OutputTextArea from '../OutputTextArea';
import NegativeSideEffectsFieldset from '../NegativeSideEffectsFieldset';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import styles from '../TestRenderer.module.css';

let tooltipCount = 0;

const CommandResults = ({
  header,
  atOutput,
  untestable,
  assertions,
  negativeSideEffects,
  assertionsHeader,
  commonIssueContent,
  commandIndex,
  isSubmitted,
  isReviewingBot,
  isReadOnly,
  isRerunReport = false,
  match = null,
  historicalAtName = null
}) => {
  const commandString = header.replace('After ', '');
  const issueLink = createIssueLink({
    ...commonIssueContent,
    commandString
  });
  const tooltipID = useMemo(() => `untestable-tooltip-${++tooltipCount}`, []);

  const matchType = match?.type;
  const hasComparableMatch = isRerunReport && !!match && !!matchType;
  const isNoMatch = hasComparableMatch && matchType === 'NONE';
  const errorMessage = isNoMatch ? 'Conflicting Output' : null;

  return (
    <>
      <h3>
        {errorMessage && (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            style={{ color: '#ce1b4c', marginRight: '8px' }}
            aria-hidden="false"
            aria-label="Conflicting Output"
          />
        )}
        {header}
      </h3>
      <OutputTextArea
        commandIndex={commandIndex}
        atOutput={atOutput}
        isSubmitted={isSubmitted}
        readOnly={isReviewingBot || isReadOnly}
        errorMessage={errorMessage}
        isRerunReport={isRerunReport}
        match={match}
        historicalAtName={historicalAtName}
        commandString={commandString}
      />

      <Tooltip>
        <TooltipContent id={tooltipID}>
          {untestable.description[0]}
        </TooltipContent>
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
        isUntestable={untestable.value}
        isSubmitted={isSubmitted}
      />
      <NegativeSideEffectsFieldset
        commandIndex={commandIndex}
        negativeSideEffects={negativeSideEffects}
        isSubmitted={isSubmitted}
        readOnly={isReadOnly}
        forceYes={untestable.value}
        hasIncompleteAssertions={assertions.some(
          assertion => assertion.passed === null
        )}
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
  negativeSideEffects: PropTypes.object.isRequired,
  assertionsHeader: PropTypes.object.isRequired,
  commonIssueContent: PropTypes.object.isRequired,
  commandIndex: PropTypes.number.isRequired,
  isSubmitted: PropTypes.bool.isRequired,
  isReviewingBot: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool.isRequired,
  isRerunReport: PropTypes.bool,
  match: PropTypes.object,
  historicalAtName: PropTypes.string
};

export default CommandResults;
