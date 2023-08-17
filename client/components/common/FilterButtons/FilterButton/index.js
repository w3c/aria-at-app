import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styled from '@emotion/styled';

const StyledFilterButton = styled(Button)`
    background: #e9ebee;
    border-radius: 16px;
    margin: 0 12px;
    background-color: white;
    font-weight: 400;
    border-color: #eceef1;

    &.active,
    &:active {
        background: #eaf3fe !important;
        border-color: #88a6d4 !important;
    }
`;

const FilterButton = ({ active, filterFunction, onClick, children }) => {
    if (!filterFunction) return; // filterFunction used by parent to filter data

    return (
        <StyledFilterButton
            variant="secondary"
            active={active}
            onClick={onClick}
        >
            {children}
        </StyledFilterButton>
    );
};

FilterButton.propTypes = {
    active: PropTypes.bool,
    filterFunction: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    children: PropTypes.node.isRequired
};

export default FilterButton;
