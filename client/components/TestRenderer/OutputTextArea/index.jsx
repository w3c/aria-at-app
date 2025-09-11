import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Form } from 'react-bootstrap';
import { NO_OUTPUT_STRING } from './constants';
import { AtOutputPropType } from '../../common/proptypes';
import styles from '../TestRenderer.module.css';

const buildHistoricalReportLink = source => {
  return source?.testResultId &&
    source?.testPlanVersionId &&
    source?.testPlanReportId ? (
    <>
      {' in '}
      <a
        href={`/report/${source.testPlanVersionId}/targets/${source.testPlanReportId}#result-${source.testResultId}`}
      >
        Report {source.testPlanReportId}
      </a>
    </>
  ) : null;
};

const renderMatchInfo = (match, historicalAtName, commandString) => {
  const prefixText =
    match?.type === 'INCOMPLETE'
      ? 'Partial cross-scenario match'
      : 'Matches output';
  return (
    <div className={styles.matchInfo}>
      {prefixText} for &apos;{commandString}&apos; from{' '}
      {`${historicalAtName} ${match?.source?.atVersionName}`}
      {buildHistoricalReportLink(match?.source)}.
    </div>
  );
};

const OutputTextArea = ({
  commandIndex,
  atOutput,
  isSubmitted,
  readOnly = false,
  errorMessage = null,
  isRerunReport = false,
  match = null,
  historicalAtName = null,
  commandString = null
}) => {
  const [noOutput, setNoOutput] = useState(atOutput.value === NO_OUTPUT_STRING);

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      if (noOutput) {
        atOutput.change(NO_OUTPUT_STRING);
      } else {
        atOutput.change('');
      }
    } else {
      isMounted.current = true;
    }
  }, [noOutput]);

  useEffect(() => {
    setNoOutput(atOutput.value === NO_OUTPUT_STRING);
  }, [atOutput.value]);

  const isNoOutputCheckboxDisabled =
    (atOutput.value && atOutput.value !== NO_OUTPUT_STRING) || readOnly;

  const errorId = errorMessage ? `output-error-${commandIndex}` : null;

  return (
    <div className={styles.outputTextContainer}>
      {isRerunReport &&
        match &&
        match?.type === 'NONE' &&
        match?.source?.output && (
          <div className={styles.historicalOutput}>
            <p>
              Output recorded for{' '}
              {`${historicalAtName} ${match?.source?.atVersionName}`}:
            </p>
            <blockquote>{match.source.output}</blockquote>
          </div>
        )}
      <label htmlFor={`speechoutput-${commandIndex}`}>
        {atOutput.description[0]}
        {isSubmitted && (
          <span
            className={clsx(
              styles.testRendererFeedback,
              styles.space,
              atOutput.description[1].required && 'required',
              atOutput.description[1].highlightRequired && 'highlight-required'
            )}
          >
            {atOutput.description[1].description}
          </span>
        )}
      </label>
      <Form.Check
        className={clsx(
          styles.noOutputCheckbox,
          isNoOutputCheckboxDisabled && styles.disabled
        )}
        checked={noOutput}
        disabled={isNoOutputCheckboxDisabled}
        label="No output"
        id={`no-output-checkbox-${commandIndex}`}
        type="checkbox"
        onChange={() => setNoOutput(!noOutput)}
      />
      <textarea
        key={`SpeechOutput__textarea__${commandIndex}`}
        id={`speechoutput-${commandIndex}`}
        autoFocus={isSubmitted && atOutput.focus}
        value={atOutput.value}
        onChange={e => atOutput.change(e.target.value)}
        disabled={noOutput}
        readOnly={readOnly}
        aria-describedby={errorId}
        className={errorMessage ? styles.errorState : ''}
      />
      {!errorMessage &&
        isRerunReport &&
        match &&
        match?.type &&
        match?.type !== 'NONE' &&
        renderMatchInfo(match, historicalAtName, commandString)}
      {errorMessage && (
        <div id={errorId} className={styles.errorMessage} role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

OutputTextArea.propTypes = {
  commandIndex: PropTypes.number.isRequired,
  atOutput: AtOutputPropType.isRequired,
  readOnly: PropTypes.bool,
  isSubmitted: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  isRerunReport: PropTypes.bool,
  match: PropTypes.object,
  historicalAtName: PropTypes.string,
  commandString: PropTypes.string
};

export default OutputTextArea;
