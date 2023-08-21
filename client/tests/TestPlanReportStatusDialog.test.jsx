/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import { InMemoryCache } from '@apollo/client';
import TestPlanReportStatusDialog from '../components/TestPlanReportStatusDialog';

// eslint-disable-next-line jest/no-mocks-import
import { TEST_PLAN_REPORT_STATUS_DIALOG_MOCK_DATA } from './__mocks__/GraphQLMocks';
// eslint-disable-next-line jest/no-mocks-import
import { mockedTestPlanVersion } from './__mocks__/GraphQLMocks/TestPlanReportStatusDialogMock';

const setup = (props, mocks = []) => {
    return render(
        <BrowserRouter>
            <MockedProvider
                mocks={mocks}
                cache={new InMemoryCache({ addTypename: false })}
            >
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
        const testPlanVersion = mockedTestPlanVersion;

        const result = setup(
            { testPlanVersion, show, handleHide },
            TEST_PLAN_REPORT_STATUS_DIALOG_MOCK_DATA
        );

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
