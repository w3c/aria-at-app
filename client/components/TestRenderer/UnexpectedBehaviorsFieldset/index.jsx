import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from '../TestRenderer.module.css';

const UnexpectedBehaviorsFieldset = ({
  commandIndex,
  unexpectedBehaviors,
  isSubmitted,
  readOnly = false,
  forceYes
}) => {
  const impactOptions = ['Moderate', 'Severe'];
  const handleUnexpectedBehaviorsExistRadioClick = e => {
    if (readOnly) e.preventDefault();
    else {
      const elId = e.target.id;
      if (elId.includes('-true')) unexpectedBehaviors.passChoice.click();
      else if (elId.includes('-false')) unexpectedBehaviors.failChoice.click();
    }
  };

  return (
    <fieldset
      className={styles.testRendererFieldset}
      id={`cmd-${commandIndex}-problems`}
    >
      <legend>{unexpectedBehaviors.description[0]}</legend>
      {isSubmitted && (
        <span
          className={clsx(
            styles.testRendererFeedback,
            unexpectedBehaviors.description[1].required && 'required',
            unexpectedBehaviors.description[1].highlightRequired &&
              'highlight-required'
          )}
        >
          {unexpectedBehaviors.description[1].description}
        </span>
      )}
      <div>
        <input
          key={`Problem__${commandIndex}__true`}
          type="radio"
          id={`problem-${commandIndex}-true`}
          name={`problem-${commandIndex}`}
          autoFocus={isSubmitted && unexpectedBehaviors.passChoice.focus}
          checked={unexpectedBehaviors.passChoice.checked}
          onChange={handleUnexpectedBehaviorsExistRadioClick}
          disabled={forceYes}
        />
        <label
          id={`problem-${commandIndex}-true-label`}
          htmlFor={`problem-${commandIndex}-true`}
        >
          {unexpectedBehaviors.passChoice.label}
        </label>
      </div>
      <div>
        <input
          key={`Problem__${commandIndex}__false`}
          type="radio"
          id={`problem-${commandIndex}-false`}
          name={`problem-${commandIndex}`}
          autoFocus={isSubmitted && unexpectedBehaviors.failChoice.focus}
          checked={unexpectedBehaviors.failChoice.checked}
          onChange={handleUnexpectedBehaviorsExistRadioClick}
        />
        <label
          id={`problem-${commandIndex}-false-label`}
          htmlFor={`problem-${commandIndex}-false`}
        >
          {unexpectedBehaviors.failChoice.label}
        </label>
      </div>

      <fieldset
        className={clsx(styles.testRendererFieldset, 'problem-select')}
        hidden={!unexpectedBehaviors.failChoice.checked}
      >
        <legend>{unexpectedBehaviors.failChoice.options.header}</legend>
        {unexpectedBehaviors.failChoice.options.options.map(
          (option, optionIndex) => {
            const {
              checked,
              focus,
              description,
              more,
              impact,
              change,
              impactchange
            } = option;

            const descriptionId = description
              .toLowerCase()
              .replace(/[.,]/g, '')
              .replace(/\s+/g, '-');

            return (
              <div
                className={clsx(
                  styles.problemOptionContainer,
                  checked && 'enabled'
                )}
                key={`AssertionOptionsKey_${optionIndex}`}
              >
                {/* Undesirable behavior checkbox */}
                <label
                  className={styles.unexpectedBehaviorsLabel}
                  key={`${descriptionId}_${commandIndex}__checkbox`}
                >
                  <input
                    type="checkbox"
                    value={description}
                    className={`undesirable-${commandIndex}`}
                    autoFocus={isSubmitted && focus}
                    checked={checked}
                    onChange={e => {
                      if (readOnly) e.preventDefault();
                      else change(e.target.checked);
                    }}
                  />
                  {description}
                </label>

                {/* Impact select */}
                <label
                  key={`${descriptionId}_${commandIndex}__impact`}
                  className={clsx(
                    styles.unexpectedBehaviorsLabel,
                    !checked && 'off-screen'
                  )}
                  aria-hidden={!checked}
                >
                  Impact:
                  <select
                    onChange={e => impactchange(e.target.value)}
                    disabled={!checked}
                    defaultValue={impact}
                  >
                    {impactOptions.map(option => (
                      <option
                        key={`${descriptionId}-${commandIndex}-impact-${option}`}
                        value={option.toUpperCase()}
                        disabled={
                          readOnly ? option.toUpperCase() !== impact : false
                        }
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Details text input */}
                {more && (
                  <>
                    <label
                      key={`${descriptionId}_${commandIndex}__details`}
                      className={clsx(
                        styles.unexpectedBehaviorsLabel,
                        !checked && 'off-screen'
                      )}
                      aria-hidden={!checked}
                    >
                      Details:
                      <input
                        type="text"
                        className={`undesirable-${descriptionId.toLowerCase()}-details`}
                        autoFocus={isSubmitted && more.focus}
                        value={more.value}
                        onChange={e => more.change(e.target.value)}
                        disabled={!checked}
                        readOnly={readOnly}
                      />
                      {isSubmitted && (
                        <span
                          className={clsx(
                            styles.testRendererFeedback,
                            styles.space,
                            more.description[1].required && 'required',
                            more.description[1].highlightRequired &&
                              'highlight-required'
                          )}
                        >
                          {more.description[1].description}
                        </span>
                      )}
                    </label>
                  </>
                )}
              </div>
            );
          }
        )}
      </fieldset>
    </fieldset>
  );
};

UnexpectedBehaviorsFieldset.propTypes = {
  commandIndex: PropTypes.number.isRequired,
  unexpectedBehaviors: PropTypes.object.isRequired,
  isSubmitted: PropTypes.bool,
  readOnly: PropTypes.bool,
  forceYes: PropTypes.bool.isRequired
};

export default UnexpectedBehaviorsFieldset;
