import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import styled from '@emotion/styled';
import FocusTrapper from '../FocusTrapper';
import { uniqueId } from 'lodash';

const ModalTitleStyle = styled.h1`
    border: 0;
    padding: 0;
    font-size: 1.5rem;
`;

const BasicModal = ({
    show = false,
    centered = false,
    animation = true,
    actionButtonClassName = '',
    closeButton = true,
    cancelButton = true,
    headerSep = true,
    showFooter = true,
    dialogClassName = '',
    title = null,
    content = null,
    closeLabel = 'Cancel',
    actionLabel = 'Continue',
    handleClose = null,
    handleAction = null,
    handleHide = null,
    staticBackdrop = false,
    useOnHide = false,
    initialFocusRef = null
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

    const id = useMemo(() => {
        return uniqueId('modal-');
    }, []);

    return (
        <FocusTrapper isActive={show} trappedElId={`focus-trapped-${id}`}>
            <Modal
                show={show}
                id={`focus-trapped-${id}`}
                centered={centered}
                animation={animation}
                onHide={useOnHide ? handleHide || handleClose : null}
                onExit={!useOnHide ? handleHide || handleClose : null}
                /* Disabled due to buggy implementation which jumps the page */
                autoFocus={false}
                aria-labelledby={`title-${id}`}
                dialogClassName={dialogClassName}
                backdrop={staticBackdrop ? 'static' : true}
            >
                <Modal.Header
                    closeButton={closeButton}
                    className={headerSep ? '' : 'border-bottom-0'}
                >
                    <Modal.Title
                        as={ModalTitleStyle}
                        tabIndex="-1"
                        ref={headerRef}
                        id={`title-${id}`}
                    >
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>{content}</Modal.Body>
                {showFooter && (
                    <Modal.Footer>
                        {cancelButton && handleClose && (
                            <Button variant="secondary" onClick={handleClose}>
                                {closeLabel}
                            </Button>
                        )}
                        {handleAction && (
                            <Button
                                variant="primary"
                                onClick={handleAction}
                                className={actionButtonClassName}
                            >
                                {actionLabel}
                            </Button>
                        )}
                    </Modal.Footer>
                )}
            </Modal>
        </FocusTrapper>
    );
};

BasicModal.propTypes = {
    show: PropTypes.bool,
    centered: PropTypes.bool,
    animation: PropTypes.bool,
    actionButtonClassName: PropTypes.string,
    closeButton: PropTypes.bool,
    cancelButton: PropTypes.bool,
    headerSep: PropTypes.bool,
    showFooter: PropTypes.bool,
    dialogClassName: PropTypes.string,
    title: PropTypes.node.isRequired,
    content: PropTypes.node.isRequired,
    closeLabel: PropTypes.string,
    actionLabel: PropTypes.string,
    handleClose: PropTypes.func,
    handleAction: PropTypes.func,
    handleHide: PropTypes.func,
    staticBackdrop: PropTypes.bool,
    useOnHide: PropTypes.bool,
    initialFocusRef: PropTypes.shape({
        current: PropTypes.any
    })
};

export default BasicModal;
