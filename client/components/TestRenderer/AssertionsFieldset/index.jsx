import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import supportJson from '../../../resources/support.json';
import RequiredWarning from '../RequiredWarning';
import styles from '../TestRenderer.module.css';

const AssertionsFieldset = ({
  assertions,
  commandIndex,
  assertionsHeader,
  readOnly = false,
  disabled,
  isSubmitted = false
}) => {
  // Handle case where build process didn't include assertionResponseQuestion
  const normalizedHeader = useMemo(() => {
    return assertionsHeader?.descriptionHeader?.replace(
      'undefined',
      supportJson.testPlanStrings.assertionResponseQuestion
    );
  }, [assertionsHeader]);

  const hasIncompleteAssertions = assertions.some(
    assertion => assertion.passed === null
  );
  const errorId = `assertions-error-${commandIndex}`;

  return (
    <fieldset className={styles.testRendererFieldset}>
      <legend id={`command-${commandIndex}-assertions-heading`}>
        {normalizedHeader}
      </legend>
      {isSubmitted && hasIncompleteAssertions && (
        <RequiredWarning id={errorId} />
      )}
      {assertions.map((assertion, assertionIndex) => {
        const { description, passed, click } = assertion;
        const isIncomplete = passed === null;

        return (
          <fieldset
            id={`assertion-fieldset-${commandIndex}-${assertionIndex}`}
            className={clsx(
              styles.testRendererFieldset,
              isSubmitted && isIncomplete && styles.incompleteFieldset
            )}
            key={`AssertionKey_${commandIndex}_${assertionIndex}`}
            disabled={disabled}
            aria-invalid={isSubmitted && isIncomplete ? 'true' : undefined}
            aria-describedby={isSubmitted && isIncomplete ? errorId : undefined}
            tabIndex={isSubmitted && isIncomplete ? 0 : -1}
          >
            <legend>{description[0]}</legend>
            <label className={styles.assertionsLabel}>
              <input
                type="radio"
                id={`pass-${commandIndex}-${assertionIndex}-yes`}
                name={`assertion-${commandIndex}-${assertionIndex}`}
                checked={passed === true}
                onChange={() => (!readOnly ? click(true) : false)}
                data-testid={`radio-yes-${commandIndex}-${assertionIndex}`}
              />
              Yes
            </label>
            <label className={styles.assertionsLabel}>
              <input
                type="radio"
                id={`pass-${commandIndex}-${assertionIndex}-no`}
                name={`assertion-${commandIndex}-${assertionIndex}`}
                checked={passed === false}
                onChange={() => (!readOnly ? click(false) : false)}
                data-testid={`radio-no-${commandIndex}-${assertionIndex}`}
              />
              No
            </label>
          </fieldset>
        );
      })}
    </fieldset>
  );
};

AssertionsFieldset.propTypes = {
  assertions: PropTypes.array.isRequired,
  commandIndex: PropTypes.number.isRequired,
  assertionsHeader: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool.isRequired,
  isSubmitted: PropTypes.bool
};

export default AssertionsFieldset;
