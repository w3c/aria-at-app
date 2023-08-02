/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
// eslint-disable-next-line jest/no-mocks-import
import { TEST_QUEUE_MUTATION_MOCK } from './__mocks__/GraphQLMocks';
import AddTestToQueueWithConfirmation from '../components/AddTestToQueueWithConfirmation';
import { BrowserRouter } from 'react-router-dom';
import { InMemoryCache } from '@apollo/client';

const setup = props => {
    return render(
        <BrowserRouter>
            <MockedProvider
                mocks={TEST_QUEUE_MUTATION_MOCK}
                cache={new InMemoryCache({ addTypename: false })}
            >
                <AddTestToQueueWithConfirmation {...props} />
            </MockedProvider>
        </BrowserRouter>
    );
};
//eslint-disable-next-line
describe('AddTestToQueueWithConfirmation', () => {
    const mockTestPlanVersion = {
        id: 5
    };
    const mockBrowser = {
        id: 2
    };
    const mockAt = {
        id: 3
    };
    let mockButtonText = 'Add to Test Queue';

    test('renders Button without error', async () => {
        const { getByTestId } = setup({
            testPlanVersion: mockTestPlanVersion,
            browser: mockBrowser,
            at: mockAt,
            buttonText: mockButtonText
        });

        await waitFor(() =>
            expect(getByTestId('add-button')).toBeInTheDocument()
        );
    });

    test('Button has correct text', async () => {
        const { getByTestId } = setup({
            testPlanVersion: mockTestPlanVersion,
            browser: mockBrowser,
            at: mockAt,
            buttonText: mockButtonText
        });

        await waitFor(() =>
            expect(getByTestId('add-button')).toHaveTextContent(mockButtonText)
        );
    });

    test('renders BasicModal without error', async () => {
        const { findByRole, getByTestId } = setup({
            testPlanVersion: mockTestPlanVersion,
            browser: mockBrowser,
            at: mockAt,
            buttonText: mockButtonText
        });

        fireEvent.click(getByTestId('add-button'));

        await waitFor(async () => {
            const modal = await findByRole('dialog');
            expect(modal).toBeInTheDocument();
        });
    });
});
