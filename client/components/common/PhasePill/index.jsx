import React from 'react';
import PropTypes from 'prop-types';
import { derivePhaseName } from '@client/utils/aria';
import styles from './PhasePill.module.css';
import clsx from 'clsx';

const PhasePill = ({ fullWidth = true, children: phase }) => {
  return (
    <span
      className={clsx(
        styles.pill,
        fullWidth && styles.fullWidth,
        styles[phase.toLowerCase()]
      )}
    >
      {derivePhaseName(phase)}
    </span>
  );
};

PhasePill.propTypes = {
  fullWidth: PropTypes.bool,
  children: PropTypes.string.isRequired
};

export default PhasePill;
