import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
    display: flex;
    flex-direction: column;

    padding: 1rem;
    margin-bottom: 1rem;
    background: #f7f7f7;

    border: 2px solid #d3d5d9;
    border-radius: 0.5rem;

    div {
        display: grid;
        align-items: center;
        grid-auto-flow: row;
        grid-template-columns: 2rem auto;

        :not(:last-child) {
            margin-bottom: 0.5rem;
        }
    }
`;

const DisclaimerInfo = ({ title = '', message = '' }) => {
    return (
        <Container>
            <div>
                <FontAwesomeIcon
                    icon={faInfoCircle}
                    color="#94979b"
                    size="lg"
                />
                <b>{title}</b>
            </div>
            <div>
                <span />
                <span>{message}</span>
            </div>
        </Container>
    );
};

DisclaimerInfo.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string
};

export default DisclaimerInfo;
