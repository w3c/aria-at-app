import React, { useState, useRef, useEffect } from 'react';
import BasicThemedModal from '@components/common/BasicThemedModal';

const THEMES = {
  WARNING: 'warning',
  DANGER: 'danger'
};

function useThemedModal({ show, type, title, content }) {
  const focusElementRef = useRef();

  const [showThemedModal, setShowThemedModal] = useState(false);
  const [themedModalType, setThemedModalType] = useState(THEMES.WARNING);
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
    setThemedModalType(THEMES.WARNING);
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

export { useThemedModal, THEMES };
