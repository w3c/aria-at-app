import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './TestRenderer.module.css';

const RequiredWarning = ({ id, className }) => {
  return (
    <span
      id={id}
      className={clsx(
        styles.testRendererFeedback,
        'required',
        'highlight-required',
        className
      )}
      role="alert"
    >
      (required)
    </span>
  );
};

RequiredWarning.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string
};

export default RequiredWarning;
