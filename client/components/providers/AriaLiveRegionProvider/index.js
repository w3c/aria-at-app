import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import styles from './AriaLiveRegionProvider.module.css';

const AriaLiveRegionContext = React.createContext();

export const useAriaLiveRegion = () => {
  const context = useContext(AriaLiveRegionContext);
  if (!context) {
    throw new Error(
      'useAriaLiveRegion must be used within an AriaLiveRegionProvider'
    );
  }
  return context;
};

export const AriaLiveRegionProvider = ({ children }) => {
  const [alertMessage, setAlertMessage] = useState('');

  return (
    <AriaLiveRegionContext.Provider value={setAlertMessage}>
      {children}
      <span
        className={styles.visuallyHiddenAriaLiveRegion}
        aria-live="polite"
        aria-atomic="true"
      >
        {alertMessage}
      </span>
    </AriaLiveRegionContext.Provider>
  );
};

AriaLiveRegionProvider.propTypes = {
  children: PropTypes.node.isRequired
};
