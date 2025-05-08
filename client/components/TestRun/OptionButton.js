import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styles from './TestRun.module.css';

const OptionButton = ({
  text,
  icon = null,
  disabled = false,
  onClick,
  children,
  ...restProps
}) => {
  return (
    <Button
      className={styles.optionBtn}
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      {...restProps}
    >
      {icon}
      {text || children}
    </Button>
  );
};

OptionButton.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node
};

export default OptionButton;
