/**
 * @jest-environment jsdom
 */
import React from 'react';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import StartBotRunButton from '../components/ManageBotRunDialog/StartBotRunButton';
import { ConfirmationModalProvider } from '../hooks/useConfirmationModal';

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client');
  return {
    ...actual,
    useApolloClient: jest.fn()
  };
});

import { useApolloClient } from '@apollo/client';

const setup = ({ mutateImpl } = {}) => {
  const mutateMock = mutateImpl || jest.fn().mockResolvedValue({ data: {} });
  useApolloClient.mockReturnValue({ mutate: mutateMock });

  const testPlanReport = {
    id: 'report-1',
    at: {
      name: 'VoiceOver for macOS',
      atVersions: [
        {
          name: '14.0',
          releasedAt: '2025-01-01T00:00:00.000Z',
          supportedByAutomation: true
        }
      ]
    }
  };

  const utils = render(
    <BrowserRouter>
      <MockedProvider mocks={[]} cache={new InMemoryCache()}>
        <ConfirmationModalProvider>
          <StartBotRunButton testPlanReport={testPlanReport} />
        </ConfirmationModalProvider>
      </MockedProvider>
    </BrowserRouter>
  );

  return { ...utils, mutateMock };
};

describe('StartBotRunButton', () => {
  test('disables modal action and shows "Starting..." immediately on click', async () => {
    const defer = {};
    defer.promise = new Promise(resolve => {
      defer.resolve = resolve;
    });
    const mutateMock = jest.fn(() => defer.promise);

    setup({ mutateImpl: mutateMock });

    // Open modal
    fireEvent.click(
      screen.getByRole('button', { name: /Start VoiceOver Bot Run/i })
    );

    // Confirm button appears
    const confirmBtn = await screen.findByTestId('confirm-start-bot-run');
    expect(confirmBtn).toBeInTheDocument();
    expect(confirmBtn).toHaveTextContent('Start');
    expect(confirmBtn).not.toBeDisabled();

    // Click confirm once
    fireEvent.click(confirmBtn);

    // It should immediately disable and show Starting...
    await waitFor(() => {
      expect(screen.getByTestId('confirm-start-bot-run')).toBeDisabled();
      expect(screen.getByTestId('confirm-start-bot-run')).toHaveTextContent(
        'Starting...'
      );
    });

    // Release the pending mutation to allow cleanup
    defer.resolve({ data: {} });

    // Wait for modal to close and async state updates to settle
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('confirm-start-bot-run')
    );

    // Mutation should be called once
    expect(mutateMock).toHaveBeenCalledTimes(1);
  });

  test('rapid clicks only trigger one mutation', async () => {
    const defer = {};
    defer.promise = new Promise(resolve => {
      defer.resolve = resolve;
    });
    const mutateMock = jest.fn(() => defer.promise);

    setup({ mutateImpl: mutateMock });

    // Open modal
    fireEvent.click(
      screen.getByRole('button', { name: /Start VoiceOver Bot Run/i })
    );

    const confirmBtn = await screen.findByTestId('confirm-start-bot-run');

    // Click multiple times rapidly
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);

    // Still only one mutation fired
    expect(mutateMock).toHaveBeenCalledTimes(1);

    // Resolve and ensure no additional calls happen
    defer.resolve({ data: {} });
    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1);
    });

    // Wait for modal to close and async state updates to settle
    const maybeConfirm = screen.queryByTestId('confirm-start-bot-run');
    if (maybeConfirm) {
      await waitForElementToBeRemoved(maybeConfirm);
    }
  });
});
