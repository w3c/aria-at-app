import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { uniqueId } from 'lodash';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import FocusTrapper from '../FocusTrapper';
import { THEMES, THEME_COLOR } from '@client/hooks/useThemedModal';
import { ModalActionPropType } from '../proptypes';
import styles from './CustomModal.module.css';
import commonStyles from '@components/common/styles.module.css';

const CustomModal = ({
  show = false,
  centered = false,
  animation = true,
  closeButton = true,
  cancelButton = true,
  headerSep = true,
  showFooter = true,
  dialogClassName = '',
  title = null,
  content = null,
  showCloseAction = true,
  closeLabel = 'Cancel',
  handleClose = null,
  handleHide = null,
  staticBackdrop = false,
  useOnHide = false,
  actions = [],
  initialFocusRef = null,
  theme = null // warning, danger, success
}) => {
  const headerRef = useRef();

  useEffect(() => {
    if (!show) return;
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else {
      headerRef.current.focus();
    }
  }, [show]);

  const id = useMemo(() => uniqueId('modal-'), []);

  const renderAction = (action, index) =>
    action.component ? (
      React.createElement(action.component, {
        key: `CustomModalAction_${index}`,
        ...action.props
      })
    ) : (
      <Button
        key={`CustomModalAction_${index}`}
        variant={action.variant ?? 'primary'}
        onClick={action.onClick}
        className={action.className ?? ''}
        data-testid={action.testId ?? ''}
      >
        {action.label ?? 'Continue'}
      </Button>
    );

  const renderTitle = () => {
    return (
      <>
        {theme && (
          <FontAwesomeIcon
            icon={
              theme === THEMES.SUCCESS ? faCheckCircle : faExclamationTriangle
            }
            size="lg"
            color={THEME_COLOR(theme)}
          />
        )}
        {title}
      </>
    );
  };

  const renderBody = () => {
    return (
      <>
        {theme ? (
          <div className={styles.innerContainer}>
            <>
              <div />
              <div>{content}</div>
            </>
          </div>
        ) : (
          <>{content}</>
        )}
      </>
    );
  };

  return (
    <FocusTrapper
      isActive={show}
      initialFocusRef={initialFocusRef?.current ? initialFocusRef : headerRef}
      trappedElId={`focus-trapped-${id}`}
    >
      <Modal
        show={show}
        id={`focus-trapped-${id}`}
        centered={centered}
        animation={animation}
        onHide={useOnHide ? handleHide || handleClose : () => {}}
        onExit={!useOnHide ? handleHide || handleClose : () => {}}
        /* Disabled due to buggy implementation which jumps the page */
        autoFocus={false}
        aria-labelledby={`title-${id}`}
        dialogClassName={dialogClassName}
        backdrop={staticBackdrop ? 'static' : true}
      >
        {theme && (
          <div
            className={styles.colorStrip}
            style={{ '--theme-color': THEME_COLOR(theme) }}
          />
        )}
        <Modal.Header
          closeButton={closeButton}
          className={headerSep ? '' : 'border-bottom-0'}
        >
          <Modal.Title
            id={`title-${id}`}
            ref={headerRef}
            tabIndex="-1"
            className={commonStyles.modalTitle}
          >
            {renderTitle()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderBody()}</Modal.Body>
        {showFooter && (
          <Modal.Footer>
            {showCloseAction && (
              <Button variant="secondary" onClick={handleClose}>
                {closeLabel}
              </Button>
            )}
            {cancelButton && handleClose && (
              <Button variant="secondary" onClick={handleClose}>
                {closeLabel}
              </Button>
            )}
            {actions.map((action, index) => renderAction(action, index))}
          </Modal.Footer>
        )}
      </Modal>
    </FocusTrapper>
  );
};

CustomModal.propTypes = {
  show: PropTypes.bool,
  centered: PropTypes.bool,
  animation: PropTypes.bool,
  closeButton: PropTypes.bool,
  cancelButton: PropTypes.bool,
  headerSep: PropTypes.bool,
  showFooter: PropTypes.bool,
  dialogClassName: PropTypes.string,
  title: PropTypes.node.isRequired,
  content: PropTypes.node,
  closeLabel: PropTypes.string,
  handleClose: PropTypes.func,
  handleHide: PropTypes.func,
  staticBackdrop: PropTypes.bool,
  useOnHide: PropTypes.bool,
  actions: PropTypes.arrayOf(ModalActionPropType),
  initialFocusRef: PropTypes.shape({
    current: PropTypes.any
  }),
  theme: PropTypes.string
};

export default CustomModal;
