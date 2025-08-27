/**
 * @jest-environment jsdom
 */

import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TestRun from '../../components/TestRun';
import { TEST_RUN_PAGE_QUERY } from '../../components/TestRun/queries';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const buildMock = () => ({
  request: { query: TEST_RUN_PAGE_QUERY, variables: { testPlanRunId: '1' } },
  result: {
    data: {
      me: { id: '2', username: 'tester', roles: ['TESTER'], isBot: false },
      users: [{ id: '2', username: 'tester', roles: ['TESTER'], isBot: false }],
      testPlanRun: {
        id: '1',
        initiatedByAutomation: false,
        collectionJob: null,
        tester: { id: '2', username: 'tester', isBot: false },
        testResults: [],
        testPlanReport: {
          id: '10',
          onHold: true,
          isRerun: false,
          conflicts: [],
          at: {
            id: '1',
            name: 'NVDA',
            atVersions: [{ id: 'a', name: '2024.1' }]
          },
          minimumAtVersion: null,
          exactAtVersion: null,
          browser: {
            id: 'b',
            name: 'Firefox',
            browserVersions: [{ id: 'bv', name: '128.0' }]
          },
          testPlanVersion: {
            id: 'tpv',
            title: 'Title',
            phase: 'DRAFT',
            versionString: 'V1',
            updatedAt: '2024-01-01'
          },
          runnableTests: []
        }
      }
    }
  }
});

describe('On Hold Modal in TestRun', () => {
  it('shows a warning modal when report is on hold for tester', async () => {
    const mocks = [buildMock()];
    const { findByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={[`/run/1`]}>
          <Routes>
            <Route path="/run/:runId" element={<TestRun />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    const text = await findByText(
      'This test has been marked on hold. Please contact the admin before continuing your work.'
    );
    expect(text).toBeInTheDocument();
  });
});
