import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowDownShortWide,
    faArrowUpShortWide
} from '@fortawesome/free-solid-svg-icons';
import { TABLE_SORT_ORDERS } from '../../../utils/enums';

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
    justify-content: space-between;
    align-items: flex-end;
    padding: 8px 12px;
    border-radius: 0;
    z-index: 0;
    display: flex;
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

const InactiveIcon = styled(FontAwesomeIcon)`
    color: rgb(155, 155, 155);
`;

const SortableTableHeader = ({ title, active, onSort = () => {} }) => {
    const [currentSortOrder, setCurrentSortOrder] = useState(
        TABLE_SORT_ORDERS.ASC
    );

    const handleClick = () => {
        const newSortOrder =
            currentSortOrder === TABLE_SORT_ORDERS.ASC
                ? TABLE_SORT_ORDERS.DESC
                : TABLE_SORT_ORDERS.ASC;
        setCurrentSortOrder(newSortOrder);
        onSort(newSortOrder);
    };

    const getIcon = () => {
        if (!active) {
            return <InactiveIcon icon={faArrowDownShortWide} />;
        }

        switch (currentSortOrder) {
            case TABLE_SORT_ORDERS.ASC:
                return <FontAwesomeIcon icon={faArrowUpShortWide} />;
            case TABLE_SORT_ORDERS.DESC:
                return <FontAwesomeIcon icon={faArrowDownShortWide} />;
            default:
                return <FontAwesomeIcon icon={faArrowDownShortWide} />;
        }
    };

    return (
        <SortableTableHeaderWrapper>
            <SortableTableHeaderButton
                onClick={handleClick}
                aria-label={`Change the table sort order to sort by ${currentSortOrder} based on the ${title} column`}
            >
                {title}
                {getIcon()}
            </SortableTableHeaderButton>
        </SortableTableHeaderWrapper>
    );
};

SortableTableHeader.propTypes = {
    title: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    onSort: PropTypes.func.isRequired
};

export default SortableTableHeader;
