/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { InMemoryCache, useMutation, useQuery } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import AddTestToQueueWithConfirmation from '../components/AddTestToQueueWithConfirmation';

jest.mock('@apollo/client');

let mutationMock;
let mockTestPlanVersion,
  mockBrowser,
  mockAt,
  mockButtonText,
  getByTestId,
  findByRole;

const mockTestPlanReportsQueryResult = {
  testPlanVersion: {
    testPlanReports: [
      {
        id: 'report1',
        testPlanRun: {
          id: 'testPlanRunId',
          isInitiatedByAutomation: false,
          markedFinalAt: null
        },
        isFinal: false,
        at: {
          id: '1',
          key: 'jaws'
        },
        browser: {
          id: '2',
          key: 'firefox'
        }
      }
    ]
  }
};

const setup = (props, mockMutation) => {
  useMutation.mockReturnValue([mockMutation, {}]);
  useQuery.mockReturnValue({
    data: mockTestPlanReportsQueryResult
  });
  return render(
    <BrowserRouter>
      <MockedProvider
        mocks={[]}
        cache={new InMemoryCache({ addTypename: false })}
      >
        <AddTestToQueueWithConfirmation {...props} />
      </MockedProvider>
    </BrowserRouter>
  );
};

const commonSetup = mockMutation => {
  mockTestPlanVersion = { id: 5 };
  mockBrowser = { id: '2', key: 'firefox', name: 'Firefox' };
  mockAt = { id: '3', key: 'voiceover_macos', name: 'VoiceOver' };
  mockButtonText = 'Add to Test Queue';

  const renderResult = setup(
    {
      testPlanVersion: mockTestPlanVersion,
      browser: mockBrowser,
      at: mockAt,
      buttonText: mockButtonText
    },
    mockMutation
  );

  getByTestId = renderResult.getByTestId;
  findByRole = renderResult.findByRole;
};

describe('AddTestToQueueWithConfirmation', () => {
  beforeEach(() => {
    mutationMock = jest.fn();
    commonSetup(mutationMock);
  });

  test('renders Button without error', async () => {
    await waitFor(() => expect(getByTestId('add-button')).toBeInTheDocument());
  });

  test('Button has correct text', async () => {
    await waitFor(() =>
      expect(getByTestId('add-button')).toHaveTextContent(mockButtonText)
    );
  });

  test('renders BasicModal without error', async () => {
    fireEvent.click(getByTestId('add-button'));

    await waitFor(async () => {
      const modal = await findByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  test('calls mutation on button click with correct variables', async () => {
    fireEvent.click(getByTestId('add-button'));
    fireEvent.click(await getByTestId('add-run-later'));

    await waitFor(() => {
      expect(mutationMock).toHaveBeenCalled();
      expect(mutationMock).toHaveBeenCalledWith({
        variables: {
          testPlanVersionId: mockTestPlanVersion.id,
          atId: mockAt.id,
          browserId: mockBrowser.id
        }
      });
    });
  });
});
