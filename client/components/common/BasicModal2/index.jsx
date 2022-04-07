import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import styled from '@emotion/styled';
import RandomImg from '../../../assets/fix-issue.svg'; // to be replaced with theme enum pointing to warning or danger icon

import './BasicModal2.css';

const ModalTitleStyle = styled.h2`
    margin: 0;
`;

const ModalInnerSectionContainer = styled.div`
    display: grid;
    grid-auto-flow: column;

    grid-template-columns: 10% auto;
    grid-gap: 10px;
`;

const ColorStrip = styled.div`
    width: 100%;
    height: 10px;
    ${props => props.hideHeadline && `display: none;`}
    background-color: ${({ theme }) =>
        theme === 'warning'
            ? '#ffad2c'
            : theme === 'danger'
            ? '#bd324e'
            : 'transparent'};

    border-top-left-radius: calc(0.3rem - 1px);
    border-top-right-radius: calc(0.3rem - 1px);
`;

const BasicModal2 = ({
    show = false,
    centered = false,
    animation = true,
    theme = 'basic', // basic, warning, danger
    title = '',
    content = null,
    actionButtons = [],
    closeLabel = 'Cancel',
    handleClose = null
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
                <ColorStrip theme={theme} />
                <Modal.Header>
                    <Modal.Title
                        as={ModalTitleStyle}
                        tabIndex="-1"
                        ref={headerRef}
                    >
                        <ModalInnerSectionContainer>
                            <img src={RandomImg} alt="Icon Description" />{' '}
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
                    {handleClose && (
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

BasicModal2.propTypes = {
    show: PropTypes.bool,
    centered: PropTypes.bool,
    animation: PropTypes.bool,
    theme: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.node,
    actionButtons: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string,
            action: PropTypes.func
        })
    ),
    closeLabel: PropTypes.string,
    handleClose: PropTypes.func
};

export default BasicModal2;
