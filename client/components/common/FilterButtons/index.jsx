import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Button } from 'react-bootstrap';

const StyledFilterButton = styled(Button)`
    background: #e9ebee;
    border-radius: 16px;
    margin: 0 12px;
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
    filterOptions,
    optionLabels,
    activeFilter,
    onFilterChange
}) => {
    return (
        <ul
            className="d-flex align-items-center my-3"
            aria-label="Filter tests plans by status"
            role="group"
        >
            <li className="mr-3" aria-hidden="true">
                Filter
            </li>
            {Object.keys(filterOptions).map(key => {
                const option = filterOptions[key];
                const isActive = activeFilter === option;
                return (
                    <li key={key} className="mr-3">
                        <StyledFilterButton
                            variant="secondary"
                            aria-pressed={isActive}
                            active={isActive}
                            onClick={() => onFilterChange(option)}
                        >
                            {optionLabels[option]}
                        </StyledFilterButton>
                    </li>
                );
            })}
        </ul>
    );
};

FilterButtons.propTypes = {
    filterOptions: PropTypes.objectOf(PropTypes.string).isRequired,
    optionLabels: PropTypes.objectOf(PropTypes.string).isRequired,
    activeFilter: PropTypes.string.isRequired,
    onFilterChange: PropTypes.func.isRequired
};

export default FilterButtons;
