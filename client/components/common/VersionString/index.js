import React from 'react';
import PropTypes from 'prop-types';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { convertDateToString } from '../../../utils/formatter';
import styled from '@emotion/styled';

const StyledPill = styled.span`
    display: inline-block;

    line-height: 2rem;
    border-radius: 4px;

    background: #f6f8fa;
    white-space: nowrap;
    text-align: center;

    &.full-width {
        width: 100%;
    }

    &:not(.full-width) {
        width: 8em;
        margin-right: 10px;
    }
`;

const VersionString = ({
    date,
    fullWidth = true,
    iconColor = '#818F98',
    linkRef,
    linkHref
}) => {
    const body = (
        <>
            <FontAwesomeIcon icon={faCircleCheck} color={iconColor} />
            <b>V{convertDateToString(date, 'YY.MM.DD')}</b>
        </>
    );

    let possibleLink;
    if (linkHref) {
        if (linkRef) {
            possibleLink = (
                <a
                    ref={linkRef}
                    href={linkHref}
                    target="_blank"
                    rel="noreferrer"
                >
                    {body}
                </a>
            );
        } else {
            possibleLink = (
                <a href={linkHref} target="_blank" rel="noreferrer">
                    {body}
                </a>
            );
        }
    } else {
        possibleLink = body;
    }

    return (
        <StyledPill className={fullWidth ? 'full-width' : ''}>
            {possibleLink}
        </StyledPill>
    );
};

VersionString.propTypes = {
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
        .isRequired,
    fullWidth: PropTypes.bool,
    iconColor: PropTypes.string,
    linkRef: PropTypes.shape({ current: PropTypes.any }),
    linkHref: PropTypes.string
};

export default VersionString;
