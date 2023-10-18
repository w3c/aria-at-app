import React from 'react';
import PropTypes from 'prop-types';
import { derivePhaseName } from '@client/utils/aria';
import styled from '@emotion/styled';

const PhaseText = styled.span`
    display: inline-block;
    padding: 2px 4px;
    border-radius: 14px;

    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    color: white;

    &.full-width {
        width: 100%;
    }
    &:not(.full-width) {
        width: min-content;
        padding: 2px 15px;
        vertical-align: middle;
        position: relative;
        top: -4px;
        margin-top: 4px; /* Improve appearance when text wraps */
    }
    &.for-header {
        border-radius: 20px;
    }

    &.rd {
        background: #4177de;
    }

    &.draft {
        background: #818f98;
    }

    &.candidate {
        background: #ff6c00;
    }

    &.recommended {
        background: #8441de;
    }

    &.deprecated {
        background: #ce1b4c;
    }
`;

const PhasePill = ({
    fullWidth = true,
    forHeader = false,
    children: phase
}) => {
    let className = fullWidth ? 'full-width' : '';
    className = forHeader ? `${className} for-header` : className;
    return (
        <PhaseText
            className={[phase.toLowerCase(), className]
                .filter(str => str)
                .join(' ')}
        >
            {derivePhaseName(phase)}
        </PhaseText>
    );
};

PhasePill.propTypes = {
    forHeader: PropTypes.bool,
    fullWidth: PropTypes.bool,
    children: PropTypes.string.isRequired
};

export default PhasePill;
