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
