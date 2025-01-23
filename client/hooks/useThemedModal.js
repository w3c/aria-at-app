import React, { useState, useRef, useEffect } from 'react';
import BasicThemedModal from '@components/common/BasicThemedModal';

const THEMES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger'
};

/**
 * Returns hex code for corresponding color
 * @param {'success'|'warning'|'danger'} theme
 * @returns {string}
 */
const THEME_COLOR = theme => {
  switch (theme) {
    case THEMES.SUCCESS:
      return '#2ba51c';
    case THEMES.WARNING:
      return '#fab700';
    case THEMES.DANGER:
      return '#ce1b4c';
    default:
      return '#fab700'; // default to warning theme if unexpected theme value
  }
};

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
