/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import BotRunTestStatusList from '../components/BotRunTestStatusList';
import {
  TEST_PLAN_RUNS_TEST_RESULTS_QUERY,
  COLLECTION_JOB_STATUS_BY_TEST_PLAN_RUN_ID_QUERY
} from '../components/BotRunTestStatusList/queries';
import '@testing-library/jest-dom/extend-expect';

const getMocks = (testPlanRuns, collectionJobStatuses) => {
  const testPlanRunMock = {
    request: {
      query: TEST_PLAN_RUNS_TEST_RESULTS_QUERY,
      variables: { testPlanReportId: '1' }
    },
    result: { data: { testPlanRuns } }
  };

  const collectionJobStatusMocks = testPlanRuns.map((testRun, index) => ({
    request: {
      query: COLLECTION_JOB_STATUS_BY_TEST_PLAN_RUN_ID_QUERY,
      variables: { testPlanRunId: testRun.id }
    },
    result: {
      data: {
        collectionJobByTestPlanRunId: {
          status: collectionJobStatuses[index],
          id: testRun.id
        }
      }
    }
  }));

  return [testPlanRunMock, ...collectionJobStatusMocks];
};

test('correctly displays statuses for single COMPLETED test run', async () => {
  const testPlanRuns = [
    {
      id: '0',
      testResults: new Array(3).fill(null),
      tester: { username: 'bot' }
    }
  ];

  const collectionJobStatuses = ['COMPLETED'];

  const mocks = getMocks(testPlanRuns, collectionJobStatuses);

  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BotRunTestStatusList testPlanReportId="1" runnableTestsLength={3} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByText('3 Tests Completed')).toBeInTheDocument();
    expect(getByText('0 Tests Queued')).toBeInTheDocument();
    expect(getByText('0 Tests Cancelled')).toBeInTheDocument();
  });
});

test('correctly ignores test results from a human-submitted test plan run', async () => {
  const testPlanRuns = [
    {
      id: '0',
      testResults: new Array(2).fill(null),
      tester: { username: 'bot' }
    },
    {
      id: '1',
      testResults: new Array(2).fill(null),
      tester: { username: 'human' }
    }
  ];

  const collectionJobStatuses = ['COMPLETED', 'COMPLETED'];

  const mocks = getMocks(testPlanRuns, collectionJobStatuses);

  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BotRunTestStatusList testPlanReportId="1" runnableTestsLength={2} />
    </MockedProvider>
  );

  await waitFor(async () => {
    expect(getByText('2 Tests Completed')).toBeInTheDocument();
    expect(getByText('0 Tests Queued')).toBeInTheDocument();
    expect(getByText('0 Tests Cancelled')).toBeInTheDocument();
  });
});

test('correctly displays statuses for CANCELLED test run', async () => {
  const testPlanRuns = [
    {
      id: '0',
      testResults: new Array(2).fill(null),
      tester: { username: 'bot' }
    }
  ];

  const collectionJobStatuses = ['CANCELLED'];

  const mocks = getMocks(testPlanRuns, collectionJobStatuses);

  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BotRunTestStatusList testPlanReportId="1" runnableTestsLength={3} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByText('2 Tests Completed')).toBeInTheDocument();
    expect(getByText('0 Tests Queued')).toBeInTheDocument();
    expect(getByText('1 Test Cancelled')).toBeInTheDocument();
  });
});

test('correctly displays statuses for multiple RUNNING and QUEUED test runs', async () => {
  const testPlanRuns = [
    {
      id: '0',
      testResults: new Array(2).fill(null),
      tester: { username: 'bot' }
    },
    {
      id: '1',
      testResults: new Array(2).fill(null),
      tester: { username: 'bot' }
    },
    {
      id: '2',
      testResults: [null],
      tester: { username: 'bot' }
    },
    {
      id: '3',
      testResults: new Array(2).fill(null),
      tester: { username: 'human' }
    }
  ];

  const collectionJobStatuses = ['RUNNING', 'RUNNING', 'CANCELLED'];

  const mocks = getMocks(testPlanRuns, collectionJobStatuses);

  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BotRunTestStatusList testPlanReportId="1" runnableTestsLength={3} />
    </MockedProvider>
  );

  await waitFor(async () => {
    // Wait for the component to update
    // Imperfect but prevents needing to detect loading removal
    await setTimeout(() => {
      expect(getByText('2 Tests Completed')).toBeInTheDocument();
      expect(getByText('1 Test Queued')).toBeInTheDocument();
      expect(getByText('1 Test Cancelled')).toBeInTheDocument();
    }, 500);
  });
});
