import React, { useState } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const Container = styled.dl`
    display: flex;
    flex-direction: column;

    padding: 1rem;
    margin-bottom: 1rem;
    background: #f7f7f7;

    border: 2px solid #d3d5d9;
    border-radius: 0.5rem;

    dt,
    dd {
        :not(:last-child) {
            margin-bottom: 0.5rem;
        }
    }
`;

const DisclaimerTitle = styled.button`
    width: fit-content;

    font-weight: bold;
    text-align: left;
    border: thin solid transparent;
    background-color: transparent;

    :hover,
    :focus {
        background-color: #eee;
    }
`;

const DisclaimerInfo = ({
    title = '',
    message = '',
    messageContent = null
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Container>
            <dt>
                <FontAwesomeIcon
                    icon={faExclamationCircle}
                    color="#94979b"
                    size="lg"
                />
                <DisclaimerTitle
                    aria-expanded={expanded}
                    aria-controls="description"
                    onClick={() => setExpanded(!expanded)}
                >
                    {title}
                </DisclaimerTitle>
            </dt>
            {expanded && (
                <dd>
                    <span id="description">{messageContent || message}</span>
                </dd>
            )}
        </Container>
    );
};

DisclaimerInfo.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    messageContent: PropTypes.node,
    expanded: PropTypes.bool
};

export default DisclaimerInfo;
