import React, { useMemo, useState } from 'react';
import { ThemeTable, ThemeTableUnavailable } from '../common/ThemeTable';
import { dates } from 'shared';
import { NoneText } from '../TestPlanVersionsPage';
import SortableTableHeader, {
  TABLE_SORT_ORDERS
} from '../common/SortableTableHeader';
import FilterButtons from '../common/FilterButtons';
import { IssuePropType } from '../common/proptypes';
import PropTypes from 'prop-types';

const FILTER_OPTIONS = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  ALL: 'All'
};

const SORT_FIELDS = {
  AUTHOR: 'author',
  TITLE: 'title',
  STATUS: 'status',
  AT: 'at',
  CREATED_AT: 'createdAt',
  CLOSED_AT: 'closedAt'
};

const SortableIssuesTable = ({ issues, issueLink }) => {
  const [activeSort, setActiveSort] = useState(SORT_FIELDS.STATUS);
  const [sortOrder, setSortOrder] = useState(TABLE_SORT_ORDERS.ASC);
  const [activeFilter, setActiveFilter] = useState('OPEN');

  const issueStats = useMemo(() => {
    const openIssues = issues.filter(issue => issue.isOpen).length;
    const closedIssues = issues.length - openIssues;
    return { openIssues, closedIssues };
  }, [issues]);

  // Helper function to get sortable value from issue
  const getSortableValue = (issue, sortField) => {
    switch (sortField) {
      case SORT_FIELDS.AUTHOR:
        return issue.author;
      case SORT_FIELDS.TITLE:
        return issue.title;
      case SORT_FIELDS.AT:
        return issue.at?.name ?? '';
      case SORT_FIELDS.CREATED_AT:
        return new Date(issue.createdAt);
      case SORT_FIELDS.CLOSED_AT:
        return issue.closedAt ? new Date(issue.closedAt) : new Date(0);
      default:
        return '';
    }
  };

  const compareByStatus = (a, b) => {
    if (a.isOpen !== b.isOpen) {
      if (sortOrder === TABLE_SORT_ORDERS.ASC) {
        return a.isOpen ? -1 : 1; // Open first for ascending
      }
      return a.isOpen ? 1 : -1; // Closed first for descending
    }
    // If status is the same, sort by date created (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  };

  const compareValues = (aValue, bValue) => {
    return sortOrder === TABLE_SORT_ORDERS.ASC
      ? aValue < bValue
        ? -1
        : 1
      : aValue > bValue
      ? -1
      : 1;
  };

  const sortedAndFilteredIssues = useMemo(() => {
    // Filter issues
    const filtered =
      activeFilter === 'ALL'
        ? issues
        : issues.filter(issue => issue.isOpen === (activeFilter === 'OPEN'));

    // Sort issues
    return filtered.sort((a, b) => {
      // Special handling for status sorting
      if (activeSort === SORT_FIELDS.STATUS) {
        return compareByStatus(a, b);
      }

      // Normal sorting for other fields
      const aValue = getSortableValue(a, activeSort);
      const bValue = getSortableValue(b, activeSort);
      return compareValues(aValue, bValue);
    });
  }, [issues, activeSort, sortOrder, activeFilter]);

  const handleSort = column => newSortOrder => {
    setActiveSort(column);
    setSortOrder(newSortOrder);
  };

  const renderTableHeader = () => (
    <thead>
      <tr>
        {[
          { field: SORT_FIELDS.AUTHOR, title: 'Author' },
          { field: SORT_FIELDS.TITLE, title: 'Issue' },
          { field: SORT_FIELDS.STATUS, title: 'Status' },
          { field: SORT_FIELDS.AT, title: 'Assistive Technology' },
          { field: SORT_FIELDS.CREATED_AT, title: 'Created On' },
          { field: SORT_FIELDS.CLOSED_AT, title: 'Closed On' }
        ].map(({ field, title }) => (
          <SortableTableHeader
            key={field}
            title={title}
            active={activeSort === field}
            onSort={handleSort(field)}
            data-test={`sort-${field.toLowerCase()}`}
          />
        ))}
      </tr>
    </thead>
  );

  const renderTableBody = () => (
    <tbody>
      {sortedAndFilteredIssues.map(issue => (
        <tr
          key={issue.link}
          data-test="issue-row"
          data-status={issue.isOpen ? 'open' : 'closed'}
        >
          <td>
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://github.com/${issue.author}`}
            >
              {issue.author}
            </a>
          </td>
          <td>
            <a target="_blank" rel="noreferrer" href={issue.link}>
              {issue.title}
            </a>
          </td>
          <td data-test="issue-status">{issue.isOpen ? 'Open' : 'Closed'}</td>
          <td>{issue.at?.name ?? 'AT not specified'}</td>
          <td>{dates.convertDateToString(issue.createdAt, 'MMM D, YYYY')}</td>
          <td>
            {!issue.closedAt ? (
              <NoneText>N/A</NoneText>
            ) : (
              dates.convertDateToString(issue.closedAt, 'MMM D, YYYY')
            )}
          </td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <>
      <h2 id="github-issues">
        GitHub Issues ({issueStats.openIssues} open, {issueStats.closedIssues}
        &nbsp;closed)
      </h2>
      <FilterButtons
        filterLabel="Filter"
        filterAriaLabel="Filter GitHub issues"
        filterOptions={FILTER_OPTIONS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      {!sortedAndFilteredIssues.length ? (
        <ThemeTableUnavailable aria-labelledby="github-issues">
          No GitHub Issues
        </ThemeTableUnavailable>
      ) : (
        <ThemeTable
          bordered
          aria-labelledby="github-issues"
          data-test="issues-table"
        >
          {renderTableHeader()}
          {renderTableBody()}
        </ThemeTable>
      )}
      {issueLink && (
        <div style={{ marginTop: '1rem' }}>
          <a href={issueLink} target="_blank" rel="noreferrer">
            Raise an Issue
          </a>
        </div>
      )}
    </>
  );
};

SortableIssuesTable.propTypes = {
  issues: PropTypes.arrayOf(IssuePropType).isRequired,
  issueLink: PropTypes.string
};

export default SortableIssuesTable;
