import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styled from '@emotion/styled';

const SortableTableHeaderWrapper = styled.th`
    position: relative;
    padding: 0;
`;

const SortableTableHeaderButton = styled(Button)`
    background: #e9ebee;
    border: none;
    color: black;
    font-size: 1rem;
    padding: 0;
    font-weight: 700;
    text-align: left;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 32px 12px;
    border-radius: 0;
    z-index: 0;
    &:hover,
    &:focus {
        background: #e9ebee;
        z-index: 1;
        color: #0b60ab;
        background-color: var(--bs-table-hover-bg);
    }

    &:hover {
        border: none;
    }
`;

export const TABLE_SORT_ORDERS = {
    ASC: 'ASCENDING',
    DESC: 'DESCENDING'
};

const SortableTableHeader = ({ title, onSort = () => {} }) => {
    const [currentSortOrder, setCurrentSortOrder] = useState(null);

    const handleClick = () => {
        const newSortOrder =
            currentSortOrder === TABLE_SORT_ORDERS.ASC
                ? TABLE_SORT_ORDERS.DESC
                : TABLE_SORT_ORDERS.ASC;
        console.log(newSortOrder);
        setCurrentSortOrder(newSortOrder);
        onSort(newSortOrder);
    };

    return (
        <SortableTableHeaderWrapper>
            <SortableTableHeaderButton
                onClick={handleClick}
                aria-label={`Change the table sort order to sort by ${currentSortOrder} based on the ${title} column`}
            >
                {title}
            </SortableTableHeaderButton>
        </SortableTableHeaderWrapper>
    );
};

SortableTableHeader.propTypes = {
    title: PropTypes.string.isRequired,
    onSort: PropTypes.func.isRequired
};

export default SortableTableHeader;
