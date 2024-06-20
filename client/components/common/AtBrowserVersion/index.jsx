import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

const VersionContainer = styled.div`
    display: inline-block;
    flex-wrap: wrap;
    background: #f5f5f5;
    border-radius: 4px;
    padding: 0 5px;
    font-weight: bold;

    & span {
        font-weight: initial;
        display: inline-block;
        margin-left: 2px;
    }
`;

const AtVersion = ({ at, minimumAtVersion, exactAtVersion }) => {
    const atVersionFormatted = minimumAtVersion
        ? `${minimumAtVersion.name} or later`
        : exactAtVersion.name;

    return (
        <VersionContainer>
            {at.name}&nbsp;
            <span>{atVersionFormatted}</span>
        </VersionContainer>
    );
};

AtVersion.propTypes = {
    at: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
    minimumAtVersion: PropTypes.shape({ name: PropTypes.string.isRequired }),
    exactAtVersion: PropTypes.shape({ name: PropTypes.string.isRequired })
};

const BrowserVersion = ({ browser }) => {
    return (
        <VersionContainer>
            {browser.name}&nbsp;
            <span>Any version</span>
        </VersionContainer>
    );
};

BrowserVersion.propTypes = {
    browser: PropTypes.shape({
        name: PropTypes.string.isRequired
    }).isRequired
};

export { AtVersion, BrowserVersion };
