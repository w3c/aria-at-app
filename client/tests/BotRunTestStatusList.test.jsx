/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import BotRunTestStatusList from '../components/BotRunTestStatusList';
import { TEST_PLAN_RUNS_TEST_RESULTS_QUERY } from '../components/BotRunTestStatusList/queries';
import '@testing-library/jest-dom';
import { COLLECTION_JOB_STATUS } from '../../server/util/enums';

const getMocks = testPlanRuns => {
  const testPlanRunMock = {
    request: {
      query: TEST_PLAN_RUNS_TEST_RESULTS_QUERY,
      variables: { testPlanReportId: '1' }
    },
    result: { data: { testPlanRuns } }
  };

  return [testPlanRunMock];
};

test('correctly displays statuses for single COMPLETED test run', async () => {
  const testPlanRuns = [
    {
      id: '0',
      testResults: new Array(3).fill(null),
      tester: { username: 'bot', isBot: true },
      collectionJob: {
        status: COLLECTION_JOB_STATUS.COMPLETED,
        testStatus: [
          { status: COLLECTION_JOB_STATUS.COMPLETED },
          { status: COLLECTION_JOB_STATUS.COMPLETED },
          { status: COLLECTION_JOB_STATUS.COMPLETED }
        ]
      }
    }
  ];

  const mocks = getMocks(testPlanRuns);

  const screen = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BotRunTestStatusList testPlanReportId="1" />
    </MockedProvider>
  );

  const { getByText } = screen;

  await waitFor(() => {
    expect(getByText('3 Tests Executed')).toBeInTheDocument();
    expect(getByText('0 Tests Queued')).toBeInTheDocument();
  });
});

test('correctly ignores test results from a human-submitted test plan run', async () => {
  const testPlanRuns = [
    {
      id: '0',
      testResults: new Array(2).fill(null),
      tester: { username: 'bot', isBot: true },
      collectionJob: {
        status: COLLECTION_JOB_STATUS.COMPLETED,
        testStatus: [
          { status: COLLECTION_JOB_STATUS.COMPLETED },
          { status: COLLECTION_JOB_STATUS.COMPLETED }
        ]
      }
    },
    {
      id: '1',
      testResults: new Array(2).fill(null),
      tester: { username: 'human', isBot: false },
      collectionJob: null
    }
  ];

  const mocks = getMocks(testPlanRuns);

  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BotRunTestStatusList testPlanReportId="1" />
    </MockedProvider>
  );

  await waitFor(async () => {
    expect(getByText('2 Tests Executed')).toBeInTheDocument();
    expect(getByText('0 Tests Queued')).toBeInTheDocument();
  });
});

// See gh-1237 - Check if user is a bot, to include in Bot Status calculation on Test Queue page
// https://github.com/w3c/aria-at-app/pull/1237
test('correctly ignores test results from a human-submitted test plan run with a collectionJob attribute', async () => {
  const testPlanRuns = [
    {
      id: '0',
      testResults: new Array(3).fill(null),
      tester: { username: 'bot', isBot: true },
      collectionJob: {
        status: COLLECTION_JOB_STATUS.COMPLETED,
        testStatus: [
          { status: COLLECTION_JOB_STATUS.COMPLETED },
          { status: COLLECTION_JOB_STATUS.COMPLETED },
          { status: COLLECTION_JOB_STATUS.COMPLETED }
        ]
      }
    },
    {
      id: '1',
      testResults: new Array(3).fill(null),
      tester: { username: 'human', isBot: false },
      collectionJob: {
        status: COLLECTION_JOB_STATUS.COMPLETED,
        testStatus: [
          { status: COLLECTION_JOB_STATUS.COMPLETED },
          { status: COLLECTION_JOB_STATUS.COMPLETED },
          { status: COLLECTION_JOB_STATUS.COMPLETED }
        ]
      }
    }
  ];

  const mocks = getMocks(testPlanRuns);

  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BotRunTestStatusList testPlanReportId="1" />
    </MockedProvider>
  );

  await waitFor(async () => {
    expect(getByText('3 Tests Executed')).toBeInTheDocument();
    expect(getByText('0 Tests Queued')).toBeInTheDocument();
  });
});

test('correctly displays statuses for CANCELLED test run', async () => {
  const testPlanRuns = [
    {
      id: '0',
      testResults: new Array(2).fill(null),
      tester: { username: 'bot', isBot: true },
      collectionJob: {
        status: COLLECTION_JOB_STATUS.CANCELLED,
        testStatus: [
          { status: COLLECTION_JOB_STATUS.COMPLETED },
          { status: COLLECTION_JOB_STATUS.COMPLETED },
          { status: COLLECTION_JOB_STATUS.CANCELLED }
        ]
      }
    }
  ];

  const mocks = getMocks(testPlanRuns);

  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BotRunTestStatusList testPlanReportId="1" />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByText('2 Tests Executed')).toBeInTheDocument();
    expect(getByText('0 Tests Queued')).toBeInTheDocument();
    expect(getByText('1 Test Cancelled')).toBeInTheDocument();
  });
});

test('correctly displays statuses for multiple RUNNING and QUEUED test runs', async () => {
  const testPlanRuns = [
    {
      id: '0',
      testResults: new Array(2).fill(null),
      tester: { username: 'bot', isBot: true },
      collectionJob: {
        status: COLLECTION_JOB_STATUS.RUNNING,
        testStatus: [
          { status: COLLECTION_JOB_STATUS.RUNNING },
          { status: COLLECTION_JOB_STATUS.COMPLETED },
          { status: COLLECTION_JOB_STATUS.QUEUED }
        ]
      }
    },
    {
      id: '1',
      testResults: new Array(2).fill(null),
      tester: { username: 'bot', isBot: true },
      collectionJob: {
        status: COLLECTION_JOB_STATUS.CANCELLED,
        testStatus: [
          { status: COLLECTION_JOB_STATUS.CANCELLED },
          { status: COLLECTION_JOB_STATUS.COMPLETED },
          { status: COLLECTION_JOB_STATUS.CANCELLED }
        ]
      }
    }
  ];

  const mocks = getMocks(testPlanRuns);

  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BotRunTestStatusList testPlanReportId="1" />
    </MockedProvider>
  );

  await waitFor(async () => {
    // Wait for the component to update
    // Imperfect but prevents needing to detect loading removal
    await setTimeout(() => {
      expect(getByText('1 Test Running')).toBeInTheDocument();
      expect(getByText('2 Tests Executed')).toBeInTheDocument();
      expect(getByText('1 Test Queued')).toBeInTheDocument();
      expect(getByText('2 Tests Cancelled')).toBeInTheDocument();
    }, 500);
  });
});
