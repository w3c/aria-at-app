import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import styled from '@emotion/styled';

const ModalTitleStyle = styled.h1`
    border: 0;
    padding: 0;
    font-size: 1.5rem;
`;

const BasicModal = ({
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
    closeLabel = 'Cancel',
    handleClose = null,
    handleHide = null,
    staticBackdrop = false,
    useOnHide = false,
    actions = []
}) => {
    const headerRef = useRef();

    useEffect(() => {
        if (!show) return;
        headerRef.current.focus();
    }, [show]);

    return (
        <>
            <Modal
                show={show}
                centered={centered}
                animation={animation}
                onHide={useOnHide ? handleHide || handleClose : null}
                onExit={!useOnHide ? handleHide || handleClose : null}
                /* Disabled due to buggy implementation which jumps the page */
                autoFocus={false}
                aria-labelledby="basic-modal"
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
                        {actions.map((action, index) => (
                            <Button
                                key={`BasicModalAction_${index}`}
                                variant="primary"
                                onClick={action.onClick}
                                className={action.className ?? ''}
                            >
                                {action.label ?? 'Continue'}
                            </Button>
                        ))}
                    </Modal.Footer>
                )}
            </Modal>
        </>
    );
};

BasicModal.propTypes = {
    show: PropTypes.bool,
    centered: PropTypes.bool,
    animation: PropTypes.bool,
    closeButton: PropTypes.bool,
    cancelButton: PropTypes.bool,
    headerSep: PropTypes.bool,
    showFooter: PropTypes.bool,
    dialogClassName: PropTypes.string,
    title: PropTypes.node.isRequired,
    content: PropTypes.node.isRequired,
    closeLabel: PropTypes.string,
    handleClose: PropTypes.func,
    handleHide: PropTypes.func,
    staticBackdrop: PropTypes.bool,
    useOnHide: PropTypes.bool,
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            onClick: PropTypes.func.isRequired,
            variant: PropTypes.string,
            className: PropTypes.string
        })
    )
};

export default BasicModal;
