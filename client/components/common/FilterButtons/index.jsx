import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Button } from 'react-bootstrap';

const StyledFilterButton = styled(Button)`
    background: #e9ebee;
    border-radius: 16px;
    margin-left: 12px;
    background-color: white;
    font-weight: 400;

    &.active,
    &:active {
        background: #eaf3fe !important;
        border: #517dbc 2px solid !important;
        box-shadow: none !important;

        &:hover,
        :focus {
            box-shadow: 0 0 0 0.2rem rgba(103, 171, 197, 0.5) !important;
        }
    }
`;

const FilterButtons = ({
    filterLabel,
    filterAriaLabel,
    filterOptions,
    activeFilter,
    onFilterChange
}) => {
    return (
        <ul
            className="d-flex align-items-center my-3"
            aria-label={filterAriaLabel || filterLabel}
            role="group"
        >
            <li aria-hidden="true">{filterLabel}</li>
            {Object.entries(filterOptions).map(([value, label]) => {
                const isActive = activeFilter === value;
                return (
                    <li key={value}>
                        <StyledFilterButton
                            variant="secondary"
                            aria-pressed={isActive}
                            active={isActive}
                            onClick={() => onFilterChange(value)}
                        >
                            {label}
                        </StyledFilterButton>
                    </li>
                );
            })}
        </ul>
    );
};

FilterButtons.propTypes = {
    filterLabel: PropTypes.string.isRequired,
    filterAriaLabel: PropTypes.string,
    filterOptions: PropTypes.objectOf(PropTypes.string).isRequired,
    activeFilter: PropTypes.string.isRequired,
    onFilterChange: PropTypes.func.isRequired
};

export default FilterButtons;
