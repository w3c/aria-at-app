import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import styled from '@emotion/styled';

const ModalTitleStyle = styled.h1`
    border: 0;
    font-size: 1.5em;
`;

const BasicModal = ({
    show = false,
    centered = false,
    animation = true,
    closeButton = true,
    title = '',
    content = null,
    closeLabel = 'Cancel',
    actionLabel = 'Continue',
    handleClose = null,
    handleAction = null
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
                onHide={handleClose}
                /* Disabled due to buggy implementation which jumps the page */
                autoFocus={false}
                aria-labelledby="basic-modal"
            >
                <Modal.Header closeButton={closeButton}>
                    <Modal.Title
                        as={ModalTitleStyle}
                        tabIndex="-1"
                        ref={headerRef}
                    >
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>{content}</Modal.Body>
                <Modal.Footer>
                    {handleClose && (
                        <Button variant="secondary" onClick={handleClose}>
                            {closeLabel}
                        </Button>
                    )}
                    {handleAction && (
                        <Button variant="primary" onClick={handleAction}>
                            {actionLabel}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
};

BasicModal.propTypes = {
    show: PropTypes.bool,
    centered: PropTypes.bool,
    animation: PropTypes.bool,
    closeButton: PropTypes.bool,
    title: PropTypes.node.isRequired,
    content: PropTypes.node.isRequired,
    closeLabel: PropTypes.string,
    actionLabel: PropTypes.string,
    handleClose: PropTypes.func,
    handleAction: PropTypes.func
};

export default BasicModal;
