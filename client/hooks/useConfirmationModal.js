import React, { createContext, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import useForceUpdate from './useForceUpdate';

const ConfirmationContext = createContext();

/**
 * Provider component for confirmation modal context. Manages modal content state
 * and provides show/hide functions to child components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 */
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

/**
 * @typedef {Object} UseConfirmationModalReturn
 * @property {Function} showConfirmationModal - Function to show the modal (modalContent) => void
 * @property {Function} hideConfirmationModal - Async function to hide the modal () => Promise<void>
 */

/**
 * Hook to access the confirmation modal context. Provides functions to show and hide
 * a confirmation modal. Must be used within a ConfirmationModalProvider.
 *
 * @returns {UseConfirmationModalReturn}
 */
const useConfirmationModal = () => {
  const { showConfirmationModal, hideConfirmationModal } =
    useContext(ConfirmationContext);

  return { showConfirmationModal, hideConfirmationModal };
};

export { ConfirmationModalProvider };
export default useConfirmationModal;
