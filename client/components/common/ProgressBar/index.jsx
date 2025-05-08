import React from 'react';
import PropTypes from 'prop-types';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ progress = 0, decorative }) => {
  const innerProgressEl = decorative ? null : `${progress}%`;

  return (
    <div className={styles.progress}>
      <div
        className={styles.front}
        style={{ clipPath: `inset(0 0 0 ${progress}%)` }}
      >
        {innerProgressEl}
      </div>
      <div className={styles.back}>{innerProgressEl}</div>
    </div>
  );
};

ProgressBar.propTypes = {
  progress: PropTypes.number,
  clipped: PropTypes.bool,
  decorative: PropTypes.bool
};

export default ProgressBar;
