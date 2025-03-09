import React from 'react';
import styles from './None.module.css';

const None = (text = 'None') => <span className={styles.none}>{text}</span>;

export { None };
