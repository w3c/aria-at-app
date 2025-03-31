import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './RadioBox.module.css';

const RadioBox = ({ name, labels, selectedLabel, onSelect }) => {
  const getOnChange = label => event => {
    if (event.target.checked) onSelect(label);
  };

  return (
    <div className="d-flex">
      {labels.map(label => {
        const isChecked = selectedLabel === label;
        return (
          <label
            key={label}
            className={clsx(
              styles.radioBoxLabel,
              isChecked && styles.applyCheckedStyle
            )}
          >
            <input
              type="radio"
              name={name}
              checked={isChecked}
              onChange={getOnChange(label)}
              className={styles.radioBoxInput}
            />
            <TextThatWontShiftWhenBold isBold={isChecked}>
              {label}
            </TextThatWontShiftWhenBold>
          </label>
        );
      })}
    </div>
  );
};

const TextThatWontShiftWhenBold = ({ isBold, children: text }) => {
  return (
    <span style={{ position: 'relative' }}>
      <span
        style={{
          position: 'absolute',
          fontWeight: isBold ? 'bold' : 'normal'
        }}
      >
        {text}
      </span>
      <span aria-hidden={true} style={{ fontWeight: 'bold', opacity: 0 }}>
        {text}
      </span>
    </span>
  );
};

TextThatWontShiftWhenBold.propTypes = {
  isBold: PropTypes.bool.isRequired,
  children: PropTypes.string.isRequired
};

RadioBox.propTypes = {
  name: PropTypes.string.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  selectedLabel: PropTypes.string,
  onSelect: PropTypes.func.isRequired
};

export default RadioBox;
