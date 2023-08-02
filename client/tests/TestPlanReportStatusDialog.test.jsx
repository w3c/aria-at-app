/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import TestPlanReportStatusDialog from '../components/Reports/TestPlanReportStatusDialog';

const setup = (props, mocks = []) => {
    return render(
        <BrowserRouter>
            <MockedProvider mocks={mocks} addTypename={false}>
                <TestPlanReportStatusDialog {...props} />
            </MockedProvider>
        </BrowserRouter>
    );
};

describe('TestPlanReportStatusDialog', () => {
    let getByRole, getByText;

    beforeEach(() => {
        const show = true;
        const handleHide = jest.fn();
        const testPlanVersion = {
            testPlanReports: []
        };

        const result = setup({ testPlanVersion, show, handleHide });

        getByRole = result.getByRole;
        getByText = result.getByText;
    });

    test('renders without error', async () => {
        await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument());
    });

    test('displays the dialog title', async () => {
        await waitFor(() => {
            expect(
                getByText('Report Status for the Test Plan')
            ).toBeInTheDocument();
        });
    });

    test('displays the table headers', async () => {
        await waitFor(() => {
            expect(getByText('Required')).toBeInTheDocument();
            expect(getByText('AT')).toBeInTheDocument();
            expect(getByText('Browser')).toBeInTheDocument();
            expect(getByText('Report Status')).toBeInTheDocument();
        });
    });
});
