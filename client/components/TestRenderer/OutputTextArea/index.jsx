import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Form } from 'react-bootstrap';
import { NO_OUTPUT_STRING } from './constants';
import { AtOutputPropType } from '../../common/proptypes';
import styles from '../TestRenderer.module.css';

const OutputTextArea = ({
  commandIndex,
  atOutput,
  isSubmitted,
  readOnly = false
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

  return (
    <div className={styles.outputTextContainer}>
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
      />
    </div>
  );
};

OutputTextArea.propTypes = {
  commandIndex: PropTypes.number.isRequired,
  atOutput: AtOutputPropType.isRequired,
  readOnly: PropTypes.bool,
  isSubmitted: PropTypes.bool.isRequired
};

export default OutputTextArea;
