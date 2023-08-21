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

    // Needed for presenting component on Version History page
    &.full-width {
        width: 100%;
    }

    &:not(.full-width) {
        width: 8em;
        margin-right: 10px;
    }

    // Needed for presenting component on Data Management page
    // Override full-width's width if both are set
    &.auto-width {
        width: auto;
        margin: 0.75rem;
    }
`;

const VersionString = ({
    date,
    fullWidth = true,
    autoWidth = true,
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

    let classes = fullWidth ? 'full-width' : '';
    classes = autoWidth ? `${classes} auto-width` : classes;

    return <StyledPill className={classes}>{possibleLink}</StyledPill>;
};

VersionString.propTypes = {
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
        .isRequired,
    fullWidth: PropTypes.bool,
    autoWidth: PropTypes.bool,
    iconColor: PropTypes.string,
    linkRef: PropTypes.shape({ current: PropTypes.any }),
    linkHref: PropTypes.string
};

export default VersionString;
