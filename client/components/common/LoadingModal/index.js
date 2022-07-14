import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'react-bootstrap';
import styled from '@emotion/styled';
import BasicModal from '../../common/BasicModal';

const Container = styled.div`
    display: flex;
    justify-content: center;
`;

const LoadingModal = ({ title }) => {
    return (
        <BasicModal
            title={title}
            show={true}
            closeButton={false}
            staticBackdrop={true}
            centered={true}
            headerSep={false}
            showFooter={false}
            content={
                <Container>
                    <Spinner
                        animation="border"
                        variant="primary"
                        role="status"
                        style={{
                            width: '50px',
                            height: '50px'
                        }}
                    />
                </Container>
            }
        />
    );
};

LoadingModal.propTypes = {
    title: PropTypes.string
};

export default LoadingModal;
