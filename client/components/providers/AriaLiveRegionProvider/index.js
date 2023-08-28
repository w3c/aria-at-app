import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

const AriaLiveRegionContext = React.createContext();

const VisuallyHiddenAriaLiveRegion = styled.span`
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
`;

export const useAriaLiveRegion = () => {
    const context = useContext(AriaLiveRegionContext);
    if (!context) {
        console.error(
            'useAriaLiveRegion must be used within an AriaLiveRegionProvider'
        );
    }
    return context;
};

export const AriaLiveRegionProvider = ({ baseMessage = '', children }) => {
    const [message, setMessage] = useState(baseMessage);

    useEffect(() => {
        return () => {
            setMessage('');
        };
    }, []);

    const updateMessage = newMessage => {
        setMessage(baseMessage + newMessage);
    };

    return (
        <AriaLiveRegionContext.Provider
            value={{ message, setMessage: updateMessage }}
        >
            {children}
            <VisuallyHiddenAriaLiveRegion aria-live="polite">
                {message}
            </VisuallyHiddenAriaLiveRegion>
        </AriaLiveRegionContext.Provider>
    );
};

AriaLiveRegionProvider.propTypes = {
    baseMessage: PropTypes.string,
    children: PropTypes.node.isRequired
};
