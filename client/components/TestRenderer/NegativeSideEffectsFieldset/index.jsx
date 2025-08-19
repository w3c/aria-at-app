import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import RequiredWarning from '../RequiredWarning';
import styles from '../TestRenderer.module.css';

const NegativeSideEffectsFieldset = ({
  commandIndex,
  negativeSideEffects,
  isSubmitted,
  readOnly = false,
  forceYes
}) => {
  const impactOptions = ['Moderate', 'Severe'];
  const handleNegativeSideEffectsExistRadioClick = e => {
    if (readOnly) e.preventDefault();
    else {
      const elId = e.target.id;
      if (elId.includes('-true')) negativeSideEffects.passChoice.click();
      else if (elId.includes('-false')) negativeSideEffects.failChoice.click();
    }
  };

  const hasError =
    isSubmitted && negativeSideEffects.description[1].highlightRequired;
  const errorId = `unexpected-error-${commandIndex}`;

  return (
    <fieldset
      className={clsx(
        styles.testRendererFieldset,
        isSubmitted && hasError && styles.incompleteFieldset
      )}
      id={`cmd-${commandIndex}-problems`}
      aria-invalid={hasError ? 'true' : undefined}
      aria-describedby={hasError ? errorId : undefined}
    >
      <legend>{negativeSideEffects.description[0]}</legend>
      {hasError && <RequiredWarning id={errorId} />}
      <div>
        <input
          key={`Problem__${commandIndex}__true`}
          type="radio"
          id={`problem-${commandIndex}-true`}
          name={`problem-${commandIndex}`}
          checked={negativeSideEffects.passChoice.checked}
          onChange={handleNegativeSideEffectsExistRadioClick}
          disabled={forceYes}
          aria-describedby={hasError ? errorId : undefined}
        />
        <label
          id={`problem-${commandIndex}-true-label`}
          htmlFor={`problem-${commandIndex}-true`}
        >
          {negativeSideEffects.passChoice.label}
        </label>
      </div>
      <div>
        <input
          key={`Problem__${commandIndex}__false`}
          type="radio"
          id={`problem-${commandIndex}-false`}
          name={`problem-${commandIndex}`}
          checked={negativeSideEffects.failChoice.checked}
          onChange={handleNegativeSideEffectsExistRadioClick}
          aria-describedby={hasError ? errorId : undefined}
        />
        <label
          id={`problem-${commandIndex}-false-label`}
          htmlFor={`problem-${commandIndex}-false`}
        >
          {negativeSideEffects.failChoice.label}
        </label>
      </div>

      <fieldset
        className={clsx(styles.testRendererFieldset, 'problem-select')}
        hidden={!negativeSideEffects.failChoice.checked}
      >
        <legend>{negativeSideEffects.failChoice.options.header}</legend>
        {negativeSideEffects.failChoice.options.options.map(
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
                {/* Negative side effect checkbox */}
                <label
                  className={styles.negativeSideEffectsLabel}
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
                    styles.negativeSideEffectsLabel,
                    !checked && 'off-screen'
                  )}
                  aria-hidden={!checked}
                >
                  Impact:
                  <select
                    onChange={e => impactchange(e.target.value)}
                    autoFocus={isSubmitted && more && more.focusImpact}
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
                        styles.negativeSideEffectsLabel,
                        !checked && 'off-screen'
                      )}
                      aria-hidden={!checked}
                    >
                      Details:
                      <input
                        type="text"
                        className={`undesirable-${descriptionId.toLowerCase()}-details`}
                        autoFocus={isSubmitted && more.focusDetails}
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

NegativeSideEffectsFieldset.propTypes = {
  commandIndex: PropTypes.number.isRequired,
  negativeSideEffects: PropTypes.object.isRequired,
  isSubmitted: PropTypes.bool,
  readOnly: PropTypes.bool,
  forceYes: PropTypes.bool.isRequired
};

export default NegativeSideEffectsFieldset;
