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

  useEffect(() => {
    setShowThemedModal(showThemedModal || show);
    setThemedModalType(themedModalType || type);
    setThemedModalTitle(themedModalTitle || title);
    setThemedModalContent(themedModalContent || content);
  });

  const onThemedModalClose = () => {
    setShowThemedModal(false);
    if (focusElementRef.current) focusElementRef.current.focus();
  };

  const setFocusRef = focusElement => (focusElementRef.current = focusElement);

  const themedModal = (
    <BasicThemedModal
      show={showThemedModal}
      theme={themedModalType}
      title={themedModalTitle}
      dialogClassName="modal-50w"
      content={themedModalContent}
      actionButtons={[
        {
          text: 'Ok',
          action: onThemedModalClose
        }
      ]}
      handleClose={onThemedModalClose}
      showCloseAction={false}
    />
  );

  return {
    setFocusRef,
    themedModal,
    showThemedModal,
    setShowThemedModal,
    setThemedModalType,
    setThemedModalTitle,
    setThemedModalContent
  };
}

export { useThemedModal, THEMES };
