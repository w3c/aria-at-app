/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

import DataManagement from '../components/DataManagement';

// eslint-disable-next-line jest/no-mocks-import
import { DATA_MANAGEMENT_PAGE_POPULATED } from './__mocks__/GraphQLMocks';

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
        const statusSummaryElement = queryAllByText(/Status Summary/i);
        const testPlansElement = queryAllByText(/Test Plans/i);
        const phaseElement = queryAllByText(/Phase/i);
        const candidateElements = queryAllByText(/Candidate/i);
        const notTestedElements = queryAllByText(/Not tested/i);

        expect(statusSummaryElement.length).toBeGreaterThanOrEqual(1);
        expect(testPlansElement.length).toBeGreaterThanOrEqual(1);
        expect(phaseElement.length).toBeGreaterThanOrEqual(1);
        expect(candidateElements.length).toBeGreaterThanOrEqual(1);
        expect(notTestedElements.length).toBeGreaterThanOrEqual(1);
    });
});
