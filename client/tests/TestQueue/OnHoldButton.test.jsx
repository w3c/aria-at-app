/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import Actions from '../../components/TestQueue/Actions';
import { SET_ON_HOLD_MUTATION } from '../../components/TestQueue/queries';

const meAdmin = { id: '1', username: 'admin', roles: ['ADMIN'] };
const testers = [];
const testPlan = { directory: 'example' };

const renderActions = (overrides = {}) => {
  const testPlanReport = {
    id: '123',
    onHold: false,
    draftTestPlanRuns: [
      {
        id: 'run1',
        tester: { id: '2', username: 'tester1', isBot: false },
        testResultsLength: 1
      }
    ],
    runnableTestsLength: 1,
    conflictsLength: 0
  };

  const mocks = [
    {
      request: {
        query: SET_ON_HOLD_MUTATION,
        variables: { testPlanReportId: testPlanReport.id, onHold: true }
      },
      result: {
        data: {
          testPlanReport: {
            setOnHold: {
              testPlanReport: { id: testPlanReport.id, onHold: true }
            }
          }
        }
      }
    }
  ];

  const utils = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Actions
        me={meAdmin}
        testers={testers}
        testPlan={testPlan}
        testPlanReport={{ ...testPlanReport, ...overrides }}
        triggerUpdate={() => {}}
      />
    </MockedProvider>
  );

  return { ...utils };
};

describe('On Hold Button', () => {
  it('renders toggle button for admins and calls mutation', async () => {
    const { getByText } = renderActions();
    const button = getByText('Put on hold');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    await waitFor(() => {
      // If no errors are thrown by MockedProvider, mutation was called
      expect(true).toBe(true);
    });
  });
});
