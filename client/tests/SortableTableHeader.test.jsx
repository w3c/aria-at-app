/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SortableTableHeader, {
  TABLE_SORT_ORDERS
} from '../components/common/SortableTableHeader';
import '@testing-library/jest-dom';
import { AriaLiveRegionProvider } from '../components/providers/AriaLiveRegionProvider';

const renderComponent = props =>
  render(
    <AriaLiveRegionProvider>
      <table>
        <thead>
          <tr>
            <SortableTableHeader {...props} />
          </tr>
        </thead>
      </table>
    </AriaLiveRegionProvider>
  );

const getAriaSort = (active, sortOrder) =>
  active
    ? sortOrder === TABLE_SORT_ORDERS.ASC
      ? 'ascending'
      : 'descending'
    : 'none';

describe('SortableTableHeader component', () => {
  const defaultProps = { title: 'Header', active: false, onSort: () => {} };

  it('should render without crashing', () => {
    renderComponent(defaultProps);
    expect(screen.getByRole('columnheader')).toBeInTheDocument();
  });

  it('should render the correct title', () => {
    renderComponent(defaultProps);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('should render the inactive icon when active is false', () => {
    renderComponent(defaultProps);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should handle sorting order and aria-sort attribute when active is true and clicked', () => {
    const onSort = jest.fn();
    renderComponent({ ...defaultProps, active: true, onSort });
    const button = screen.getByRole('button');

    expect(screen.getByRole('columnheader')).toHaveAttribute(
      'aria-sort',
      getAriaSort(true, TABLE_SORT_ORDERS.ASC)
    );

    fireEvent.click(button);
    expect(onSort).toHaveBeenCalledWith(TABLE_SORT_ORDERS.DESC);
    expect(screen.getByRole('columnheader')).toHaveAttribute(
      'aria-sort',
      getAriaSort(true, TABLE_SORT_ORDERS.DESC)
    );

    fireEvent.click(button);
    expect(onSort).toHaveBeenCalledWith(TABLE_SORT_ORDERS.ASC);
    expect(screen.getByRole('columnheader')).toHaveAttribute(
      'aria-sort',
      getAriaSort(true, TABLE_SORT_ORDERS.ASC)
    );
  });
});
