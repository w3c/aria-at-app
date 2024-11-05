import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDownShortWide,
  faArrowUpShortWide
} from '@fortawesome/free-solid-svg-icons';
import { useAriaLiveRegion } from '../../providers/AriaLiveRegionProvider';

const SortableTableHeaderWrapper = styled.th`
  background: #e9ebee;
  padding: 0 !important;
  height: 100%;
`;

const SortableTableHeaderButton = styled(Button)`
  background: transparent;
  border: none;
  color: black;
  font-size: 1rem;
  font-weight: 700;
  text-align: left;
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.5rem;
  border-radius: 0;
  margin: 0;

  // Force the button to stretch
  position: relative;
  height: stretch;
  height: -webkit-fill-available;
  height: -moz-available;

  &:hover,
  &:focus {
    color: #0b60ab;
    background-color: var(--bs-table-hover-bg);
  }
`;

const InactiveIcon = styled(FontAwesomeIcon)`
  color: rgb(155, 155, 155);
`;

export const TABLE_SORT_ORDERS = {
  ASC: 'ASCENDING',
  DESC: 'DESCENDING'
};

const SortableTableHeader = ({
  title,
  active,
  onSort = () => {},
  initialSortDirection = TABLE_SORT_ORDERS.ASC
}) => {
  const [currentSortOrder, setCurrentSortOrder] =
    useState(initialSortDirection);

  const setAlertMessage = useAriaLiveRegion();

  useEffect(() => {
    if (active) {
      const message =
        `Test Plans Status Summary Table, now sorted by ${title} in ` +
        `${currentSortOrder.toLowerCase()} order`;
      setAlertMessage(message);
    }
  }, [active, currentSortOrder, setAlertMessage, title]);

  const handleClick = () => {
    if (active) {
      const newSortOrder =
        currentSortOrder === TABLE_SORT_ORDERS.ASC
          ? TABLE_SORT_ORDERS.DESC
          : TABLE_SORT_ORDERS.ASC;
      setCurrentSortOrder(newSortOrder);
      onSort(newSortOrder);
    } else {
      onSort(currentSortOrder);
    }
  };

  const getIcon = () => {
    const icon =
      currentSortOrder === TABLE_SORT_ORDERS.ASC
        ? faArrowUpShortWide
        : faArrowDownShortWide;

    const attribs = {
      'aria-hidden': 'true',
      focusable: 'false',
      icon: icon
    };

    if (active) {
      return <FontAwesomeIcon {...attribs} />;
    } else {
      return <InactiveIcon {...attribs} />;
    }
  };

  const getAriaSort = () => {
    if (!active) {
      return 'none';
    } else {
      return currentSortOrder === TABLE_SORT_ORDERS.ASC
        ? 'ascending'
        : 'descending';
    }
  };

  return (
    <SortableTableHeaderWrapper
      role="columnheader"
      scope="col"
      aria-sort={getAriaSort()}
    >
      <SortableTableHeaderButton onClick={handleClick}>
        {title}
        {getIcon()}
      </SortableTableHeaderButton>
    </SortableTableHeaderWrapper>
  );
};

SortableTableHeader.propTypes = {
  title: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onSort: PropTypes.func.isRequired,
  initialSortDirection: PropTypes.oneOf([
    TABLE_SORT_ORDERS.ASC,
    TABLE_SORT_ORDERS.DESC
  ])
};

export default SortableTableHeader;
