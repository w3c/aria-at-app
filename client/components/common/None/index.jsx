import React from 'react';
import styles from './None.module.css';
import clsx from 'clsx';

const None = (text = 'None', { centered, absolutePositioning } = {}) => (
  <span
    className={clsx(
      styles.none,
      centered && styles.centered,
      absolutePositioning && styles.absolute
    )}
  >
    {text}
  </span>
);

export { None };
