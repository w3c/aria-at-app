/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { DATA_MANAGEMENT_TABLE_FILTER_OPTIONS } from '../utils/constants';
import '@testing-library/jest-dom';
import FilterButtons from '../components/common/FilterButtons';

describe('FilterButtons', () => {
    const filterOptions = DATA_MANAGEMENT_TABLE_FILTER_OPTIONS;
    const optionLabels = {
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RD]: `R&D Complete`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.DRAFT]: `In Draft Review`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.CANDIDATE]: `In Candidate Review`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RECOMMENDED]: `Recommended Plans`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL]: `All Plans`
    };
    const defaultProps = {
        filterOptions,
        optionLabels,
        activeFilter: DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL,
        onFilterChange: () => {}
    };

    it('should render without crashing', () => {
        render(<FilterButtons {...defaultProps} />);
        expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('should render the correct filter labels', () => {
        render(<FilterButtons {...defaultProps} />);
        Object.values(optionLabels).forEach(label => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });
    });

    it('should render the active filter with correct styles', () => {
        render(<FilterButtons {...defaultProps} />);
        const activeButton = screen
            .getByText(optionLabels[DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL])
            .closest('button');
        expect(activeButton).toHaveAttribute('aria-pressed', 'true');
        expect(activeButton).toHaveClass('active');
    });

    it('should change filter on button click', () => {
        const onFilterChange = jest.fn();
        render(
            <FilterButtons {...defaultProps} onFilterChange={onFilterChange} />
        );
        const button = screen
            .getByText(
                optionLabels[DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RECOMMENDED]
            )
            .closest('button');
        fireEvent.click(button);
        expect(onFilterChange).toHaveBeenCalledWith(
            DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RECOMMENDED
        );
    });
});
