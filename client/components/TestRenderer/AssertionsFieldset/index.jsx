import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import supportJson from '../../../resources/support.json';
import styles from '../TestRenderer.module.css';

const AssertionsFieldset = ({
  assertions,
  commandIndex,
  assertionsHeader,
  readOnly = false,
  disabled
}) => {
  // Handle case where build process didn't include assertionResponseQuestion
  const normalizedHeader = useMemo(() => {
    return assertionsHeader?.descriptionHeader?.replace(
      'undefined',
      supportJson.testPlanStrings.assertionResponseQuestion
    );
  }, [assertionsHeader]);

  return (
    <fieldset className={styles.testRendererFieldset}>
      <legend id={`command-${commandIndex}-assertions-heading`}>
        {normalizedHeader}
      </legend>
      {assertions.map((assertion, assertionIndex) => {
        const { description, passed, click } = assertion;
        return (
          <fieldset
            className={styles.testRendererFieldset}
            key={`AssertionKey_${commandIndex}_${assertionIndex}`}
            disabled={disabled}
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
  disabled: PropTypes.bool.isRequired
};

export default AssertionsFieldset;
