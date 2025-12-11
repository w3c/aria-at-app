import React, { useState, useRef, useEffect } from 'react';
import BasicThemedModal from '@components/common/BasicThemedModal';

const THEMES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger'
};

/**
 * Returns CSS variable for corresponding theme color.
 * Defaults to 'warning' theme if none provided.
 *
 * @param {'success'|'warning'|'danger'} theme - Theme name
 * @returns {string} CSS variable for the theme color
 */
const THEME_COLOR = theme => {
  if (!theme) return THEME_COLOR(THEMES.WARNING);

  switch (theme) {
    case THEMES.SUCCESS:
      return 'var(--success-status-color)';
    case THEMES.WARNING:
      return 'var(--warning-status-color)';
    case THEMES.DANGER:
      return 'var(--danger-status-color)';
  }
};

/**
 * @typedef {Object} UseThemedModalOptions
 * @property {boolean} show - Whether the modal should be shown
 * @property {'success'|'warning'|'danger'} [type=THEMES.WARNING] - Theme type for the modal
 * @property {string} [title=''] - Modal title
 * @property {React.ReactNode} [content] - Modal content
 */

/**
 * @typedef {Object} UseThemedModalReturn
 * @property {React.ReactNode} themedModal - The modal component to render
 * @property {boolean} showThemedModal - Current show state
 * @property {Function} setShowThemedModal - Function to update show state
 * @property {Function} setThemedModalType - Function to update theme type
 * @property {Function} setThemedModalTitle - Function to update title
 * @property {Function} setThemedModalContent - Function to update content
 * @property {Function} setThemedModalActions - Function to set custom action buttons
 * @property {Function} setThemedModalShowCloseAction - Function to show/hide close button
 * @property {Function} focus - Function to focus the element stored in focusElementRef
 * @property {Function} setFocusRef - Function to set the element to focus on close
 * @property {Function} hideThemedModal - Function to hide and reset the modal
 */

/**
 * Hook for managing a themed modal with success, warning, or danger styling.
 * Provides state management and control functions for modal display and content.
 *
 * @param {UseThemedModalOptions} options - Configuration options
 * @returns {UseThemedModalReturn}
 */
function useThemedModal({ show, type = THEMES.WARNING, title, content }) {
  const focusElementRef = useRef();

  const [showThemedModal, setShowThemedModal] = useState(false);
  const [themedModalType, setThemedModalType] = useState(type);
  const [themedModalTitle, setThemedModalTitle] = useState('');
  const [themedModalContent, setThemedModalContent] = useState(<></>);
  const [themedModalActions, setThemedModalActions] = useState(null);
  const [themedModalShowCloseAction, setThemedModalShowCloseAction] =
    useState(false);

  useEffect(() => {
    setShowThemedModal(showThemedModal || show);
    setThemedModalType(themedModalType || type);
    setThemedModalTitle(themedModalTitle || title);
    setThemedModalContent(themedModalContent || content);
  });

  const hideThemedModal = () => {
    setShowThemedModal(false);
    setThemedModalType(type);
    setThemedModalTitle('');
    setThemedModalContent(<></>);
    setThemedModalActions(null);
    setThemedModalShowCloseAction(false);
  };

  const onThemedModalClose = () => {
    setShowThemedModal(false);
    if (focusElementRef.current) focusElementRef.current.focus();
  };

  const setFocusRef = focusElement =>
    (focusElementRef.current = focusElement?.current || focusElement);

  const focus = () => {
    if (focusElementRef.current) focusElementRef.current.focus();
  };

  const themedModal = (
    <BasicThemedModal
      show={showThemedModal}
      theme={themedModalType}
      title={themedModalTitle}
      dialogClassName="modal-50w"
      content={themedModalContent}
      actionButtons={
        themedModalActions
          ? themedModalActions
          : [
              {
                text: 'Ok',
                action: onThemedModalClose
              }
            ]
      }
      handleClose={onThemedModalClose}
      showCloseAction={themedModalShowCloseAction}
    />
  );

  return {
    themedModal,
    showThemedModal,
    setShowThemedModal,
    setThemedModalType,
    setThemedModalTitle,
    setThemedModalContent,
    setThemedModalActions,
    setThemedModalShowCloseAction,
    focus,
    setFocusRef,
    hideThemedModal
  };
}

export { useThemedModal, THEMES, THEME_COLOR };
