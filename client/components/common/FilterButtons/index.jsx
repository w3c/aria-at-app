import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styles from './FilterButtons.module.css';

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
            <Button
              data-test={`filter-${value.toLowerCase()}`}
              variant="secondary"
              aria-pressed={isActive}
              active={isActive}
              onClick={() => onFilterChange(value)}
              className={styles.filterButton}
            >
              {label}
            </Button>
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
