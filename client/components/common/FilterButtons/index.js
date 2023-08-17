import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

const FilterButtonsWrapper = styled.ul`
    display: flex;
    align-items: center;
`;

const FilterButtons = ({ children, onFilterChange }) => {
    const [activeFilter, setActiveFilter] = useState(null);

    const handleClick = (index, filterFunction) => {
        setActiveFilter(index);
        onFilterChange(filterFunction);
    };

    return (
        <FilterButtonsWrapper>
            <li>Filter</li>
            {React.Children.map(children, (child, index) => {
                if (!child.props.filterFunction) {
                    console.warn(
                        'FilterButtons must have FilterButton children with a filterFunction prop'
                    );
                    return;
                }
                return (
                    <li key={index}>
                        {React.cloneElement(child, {
                            active: activeFilter === index,
                            onClick: () =>
                                handleClick(index, child.props.filterFunction)
                        })}
                    </li>
                );
            })}
        </FilterButtonsWrapper>
    );
};

FilterButtons.propTypes = {
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    onFilterChange: PropTypes.func.isRequired
};

export default FilterButtons;
