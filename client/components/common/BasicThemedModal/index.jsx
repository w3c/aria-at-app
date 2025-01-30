import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import styled from '@emotion/styled';
import { uniqueId } from 'lodash';
import { THEMES, THEME_COLOR } from '@client/hooks/useThemedModal';
import { ActionButtonPropType } from '../proptypes';

const ModalTitleStyle = styled.h1`
  border: 0;
  padding: 0;
  font-size: 1.5rem;
`;

const ModalInnerSectionContainer = styled.div`
  display: grid;
  grid-auto-flow: column;

  grid-template-columns: 50px auto;
  grid-gap: 10px;
`;

const ColorStrip = styled.div`
  width: 100%;
  height: 10px;
  ${props => props.hideHeadline && `display: none;`}
  background-color: ${({ theme }) => THEME_COLOR(theme)};
  border-top-left-radius: calc(0.3rem - 1px);
  border-top-right-radius: calc(0.3rem - 1px);
`;

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
        <ColorStrip theme={theme} />
        <Modal.Header className="border-bottom-0">
          <Modal.Title
            as={ModalTitleStyle}
            tabIndex="-1"
            ref={headerRef}
            id={`title-${id}`}
          >
            <ModalInnerSectionContainer>
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
            </ModalInnerSectionContainer>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ModalInnerSectionContainer>
            <>
              <div />
              <div>{content}</div>
            </>
          </ModalInnerSectionContainer>
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
