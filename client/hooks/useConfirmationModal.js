import React, { createContext, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import useForceUpdate from './useForceUpdate';

const ConfirmationContext = createContext();

const ConfirmationModalProvider = ({ children }) => {
  const forceUpdate = useForceUpdate();
  const modalContent = useRef();

  const showConfirmationModal = newModalContent => {
    modalContent.current = newModalContent;
    forceUpdate();
  };

  const hideConfirmationModal = async () => {
    modalContent.current = null;
    forceUpdate();
  };

  return (
    <ConfirmationContext.Provider
      value={{ showConfirmationModal, hideConfirmationModal }}
    >
      {children}
      {modalContent.current}
    </ConfirmationContext.Provider>
  );
};

ConfirmationModalProvider.propTypes = {
  children: PropTypes.node.isRequired
};

const useConfirmationModal = () => {
  const { showConfirmationModal, hideConfirmationModal } =
    useContext(ConfirmationContext);

  return { showConfirmationModal, hideConfirmationModal };
};

export { ConfirmationModalProvider };
export default useConfirmationModal;
