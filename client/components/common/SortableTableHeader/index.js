import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDownShortWide,
  faArrowUpShortWide
} from '@fortawesome/free-solid-svg-icons';
import { useAriaLiveRegion } from '../../providers/AriaLiveRegionProvider';
import styles from './SortableTableHeader.module.css';

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
      return <FontAwesomeIcon className={styles.inactive} {...attribs} />;
    }
  };

  /**
   * @returns {'none'|'ascending'|'descending'}
   */
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
    <th
      role="columnheader"
      scope="col"
      aria-sort={getAriaSort()}
      className={styles.styledHeader}
    >
      <Button className={styles.headerButton} onClick={handleClick}>
        {title}
        {getIcon()}
      </Button>
    </th>
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
