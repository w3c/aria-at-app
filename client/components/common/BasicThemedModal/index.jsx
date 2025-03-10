import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { uniqueId } from 'lodash';
import { THEMES, THEME_COLOR } from '@client/hooks/useThemedModal';
import { ActionButtonPropType } from '../proptypes';
import styles from './BasicThemedModal.module.css';
import commonStyles from '../../styles.module.css';

const BasicThemedModal = ({
  show = false,
  centered = false,
  animation = true,
  theme = THEMES.WARNING, // warning, danger, success
  dialogClassName = '',
  title = null,
  content = null,
  actionButtons = [],
  closeLabel = 'Cancel',
  handleClose = null,
  showCloseAction = true
}) => {
  const headerRef = useRef();

  useEffect(() => {
    if (!show) return;
    headerRef.current.focus();
  }, [show]);

  const id = useMemo(() => {
    return uniqueId('modal-');
  }, []);

  return (
    <>
      <Modal
        show={show}
        centered={centered}
        animation={animation}
        onExit={handleClose}
        /* Disabled due to buggy implementation which jumps the page */
        autoFocus={false}
        aria-labelledby={`title-${id}`}
        dialogClassName={dialogClassName}
      >
        <div
          className={styles.colorStrip}
          style={{ '--theme-color': THEME_COLOR(theme) }}
        />
        <Modal.Header className="border-bottom-0">
          <Modal.Title
            id={`title-${id}`}
            ref={headerRef}
            tabIndex="-1"
            className={commonStyles.modalTitle}
          >
            <div className={styles.innerContainer}>
              <FontAwesomeIcon
                icon={
                  theme === THEMES.SUCCESS
                    ? faCheckCircle
                    : faExclamationTriangle
                }
                size="lg"
                color={THEME_COLOR(theme)}
              />
              {title}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.innerContainer}>
            <>
              <div />
              <div>{content}</div>
            </>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {showCloseAction && (
            <Button variant="secondary" onClick={handleClose}>
              {closeLabel}
            </Button>
          )}
          {actionButtons.map(({ action, text }) => (
            <Button
              key={text}
              variant={theme === THEMES.DANGER ? 'danger' : 'primary'}
              onClick={action}
            >
              {text}
            </Button>
          ))}
        </Modal.Footer>
      </Modal>
    </>
  );
};

BasicThemedModal.propTypes = {
  show: PropTypes.bool,
  centered: PropTypes.bool,
  animation: PropTypes.bool,
  theme: PropTypes.string,
  dialogClassName: PropTypes.string,
  title: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  actionButtons: PropTypes.arrayOf(ActionButtonPropType),
  closeLabel: PropTypes.string,
  handleClose: PropTypes.func,
  showCloseAction: PropTypes.bool
};

export default BasicThemedModal;
