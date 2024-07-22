import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

const AriaLiveRegionContext = React.createContext();

const VisuallyHiddenAriaLiveRegion = styled.span`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
`;

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
      <VisuallyHiddenAriaLiveRegion aria-live="polite" aria-atomic="true">
        {alertMessage}
      </VisuallyHiddenAriaLiveRegion>
    </AriaLiveRegionContext.Provider>
  );
};

AriaLiveRegionProvider.propTypes = {
  children: PropTypes.node.isRequired
};
