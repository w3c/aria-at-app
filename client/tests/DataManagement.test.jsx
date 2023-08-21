/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, renderHook, waitFor } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

import DataManagement from '../components/DataManagement';

// eslint-disable-next-line jest/no-mocks-import
import { DATA_MANAGEMENT_PAGE_POPULATED } from './__mocks__/GraphQLMocks';
import { useDataManagementTableSorting } from '../components/DataManagement/hooks';
import {
    DATA_MANAGEMENT_TABLE_SORT_OPTIONS,
    TABLE_SORT_ORDERS
} from '../utils/constants';
import { act } from 'react-dom/test-utils';

const setup = (mocks = []) => {
    return render(
        <BrowserRouter>
            <MockedProvider
                mocks={mocks}
                cache={new InMemoryCache({ addTypename: false })}
            >
                <DataManagement />
            </MockedProvider>
        </BrowserRouter>
    );
};

describe('Data Management page', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = setup(DATA_MANAGEMENT_PAGE_POPULATED);
    });

    it('renders loading state on initialization', async () => {
        const { getByTestId } = wrapper;
        const element = getByTestId('page-status');

        expect(element).toBeTruthy();
        expect(element).toHaveTextContent('Loading');
    });

    it('renders Status Summary component', async () => {
        // allow page time to load
        await waitFor(() => new Promise(res => setTimeout(res, 0)));

        const { queryAllByText } = wrapper;
        const statusSummaryElement = queryAllByText(
            /Test Plans Status Summary/i
        );
        const testPlanElement = queryAllByText(/Test Plan/i);
        const coveredAtElement = queryAllByText(/Covered AT/i);
        const overallStatusElement = queryAllByText(/Overall Status/i);
        const rdElement = queryAllByText(/R&D Version/i);
        const draftElement = queryAllByText(/Draft Review/i);
        const candidateElement = queryAllByText(/Candidate Review/i);
        const recommendedElement = queryAllByText(/Recommended Version/i);

        expect(statusSummaryElement.length).toBeGreaterThanOrEqual(1);
        expect(testPlanElement.length).toBeGreaterThanOrEqual(1);
        expect(coveredAtElement.length).toBeGreaterThanOrEqual(1);
        expect(overallStatusElement.length).toBeGreaterThanOrEqual(1);
        expect(rdElement.length).toBeGreaterThanOrEqual(1);
        expect(draftElement.length).toBeGreaterThanOrEqual(1);
        expect(candidateElement.length).toBeGreaterThanOrEqual(1);
        expect(recommendedElement.length).toBeGreaterThanOrEqual(1);
    });
});

describe('useDataManagementTableSorting hook', () => {
    const testPlans = [
        { title: 'Test A', directory: 'dirA' },
        { title: 'Test B', directory: 'dirB' },
        { title: 'Test C', directory: 'dirC' }
    ];

    const testPlanVersions = [
        { phase: 'RD', testPlan: { directory: 'dirA' } },
        { phase: 'DRAFT', testPlan: { directory: 'dirB' } },
        { phase: 'CANDIDATE', testPlan: { directory: 'dirC' } }
    ];

    const ats = []; // ATs are stubbed out for now

    it('sorts by phase by default', () => {
        const { result } = renderHook(() =>
            useDataManagementTableSorting(testPlans, testPlanVersions, ats)
        );
        expect(result.current.sortedTestPlans).toEqual([
            { title: 'Test C', directory: 'dirC' }, // CANDIDATE
            { title: 'Test B', directory: 'dirB' }, // DRAFT
            { title: 'Test A', directory: 'dirA' } // RD
        ]);
    });

    it('can sort by name', () => {
        const { result } = renderHook(() =>
            useDataManagementTableSorting(testPlans, testPlanVersions, ats)
        );
        act(() =>
            result.current.updateSort({
                key: DATA_MANAGEMENT_TABLE_SORT_OPTIONS.NAME,
                direction: TABLE_SORT_ORDERS.DESC
            })
        );
        expect(result.current.sortedTestPlans).toEqual([
            { title: 'Test A', directory: 'dirA' },
            { title: 'Test B', directory: 'dirB' },
            { title: 'Test C', directory: 'dirC' }
        ]);
    });
});
