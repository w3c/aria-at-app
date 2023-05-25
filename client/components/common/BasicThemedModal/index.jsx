import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import styled from '@emotion/styled';

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
    background-color: ${({ theme }) =>
        theme === 'danger' ? '#ce1b4c' : '#fab700'};

    border-top-left-radius: calc(0.3rem - 1px);
    border-top-right-radius: calc(0.3rem - 1px);
`;

const BasicThemedModal = ({
    show = false,
    centered = false,
    animation = true,
    theme = 'warning', // warning, danger
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
                dialogClassName={dialogClassName}
            >
                <ColorStrip theme={theme} />
                <Modal.Header className="border-bottom-0">
                    <Modal.Title
                        as={ModalTitleStyle}
                        tabIndex="-1"
                        ref={headerRef}
                    >
                        <ModalInnerSectionContainer>
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                size="lg"
                                color={
                                    theme === 'danger' ? '#ce1b4c' : '#fab700'
                                }
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
                    {actionButtons.length &&
                        actionButtons.map(({ action, text }) => (
                            <Button
                                key={text}
                                variant={
                                    theme === 'danger' ? 'danger' : 'primary'
                                }
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
    actionButtons: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string,
            action: PropTypes.func
        })
    ),
    closeLabel: PropTypes.string,
    handleClose: PropTypes.func,
    showCloseAction: PropTypes.bool
};

export default BasicThemedModal;
