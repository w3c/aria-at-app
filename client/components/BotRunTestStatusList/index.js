import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { TEST_PLAN_RUNS_TEST_RESULTS_QUERY } from './queries';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import ReportStatusDot from '../common/ReportStatusDot';

const BotRunTestContainer = styled.div`
  font-size: 0.875rem !important;
  padding: 0.5rem 0;
  margin: 0.5rem 0;

  background: #f5f5f5;
  border-radius: 0.25rem;

  white-space: nowrap;
`;

const BotRunTestStatusUnorderedList = styled.ul`
  list-style-type: none;
`;

/**
 * Generate a string describing the status of some number of "Tests" where the
 * word "Test" is pluralized appropriately and qualified with the provided
 * status. As a single primitive string value, the output of this utility
 * function can be rendered into the document without interstitial space
 * characters which produces unnatural speech in some screen readers:
 *
 * https://github.com/w3c/aria-at-app/issues/872
 *
 * @param {number} count the integer number of tests being described
 * @param {string} status the status of the tests being described
 *
 * @returns {string} the pluralized text
 */
const testCountString = (count, status) =>
  `${count} Test${count === 1 ? '' : 's'} ${status}`;

const pollInterval = 2000;

const BotRunTestStatusList = ({ testPlanReportId }) => {
  const {
    data: testPlanRunsQueryResult,
    startPolling,
    stopPolling
  } = useQuery(TEST_PLAN_RUNS_TEST_RESULTS_QUERY, {
    variables: { testPlanReportId },
    fetchPolicy: 'cache-and-network',
    pollInterval
  });

  const { COMPLETED, ERROR, RUNNING, CANCELLED, QUEUED } = useMemo(() => {
    const counter = {
      COMPLETED: 0,
      ERROR: 0,
      RUNNING: 0,
      CANCELLED: 0,
      QUEUED: 0
    };
    let anyPossibleUpdates = false;
    if (testPlanRunsQueryResult?.testPlanRuns) {
      for (const { collectionJob } of testPlanRunsQueryResult.testPlanRuns) {
        if (collectionJob?.testStatus) {
          for (const { status } of collectionJob.testStatus) {
            counter[status]++;
            if (status === 'QUEUED' || status === 'RUNNING') {
              anyPossibleUpdates = true;
            }
          }
        }
      }
      // it's possible that we got incomplete data on first fetch and
      // stopped the polling, so restart the polling if we detect any
      // possible future updates, otherwise stop.
      if (anyPossibleUpdates) {
        startPolling(pollInterval);
      } else {
        stopPolling();
      }
    }
    return counter;
  }, [testPlanRunsQueryResult, stopPolling, startPolling]);

  if (
    !testPlanRunsQueryResult ||
    testPlanRunsQueryResult.testPlanRuns.length === 0
  ) {
    return null;
  }

  return (
    <>
      <BotRunTestContainer>
        Bot Status:
        <BotRunTestStatusUnorderedList className="text-secondary">
          {RUNNING > 0 && (
            <li>
              <ReportStatusDot className="tests-running" />
              {testCountString(RUNNING, 'Running')}
            </li>
          )}
          {ERROR > 0 && (
            <li>
              <ReportStatusDot className="tests-error" />
              {testCountString(ERROR, 'Error')}
            </li>
          )}
          <li>
            <ReportStatusDot className="tests-complete" />
            {testCountString(COMPLETED, 'Completed')}
          </li>
          <li>
            <ReportStatusDot className="tests-queued" />
            {testCountString(QUEUED, 'Queued')}
          </li>
          {CANCELLED > 0 && (
            <li>
              <ReportStatusDot className="tests-cancelled" />
              {testCountString(CANCELLED, 'Cancelled')}
            </li>
          )}
        </BotRunTestStatusUnorderedList>
      </BotRunTestContainer>
    </>
  );
};

BotRunTestStatusList.propTypes = {
  testPlanReportId: PropTypes.string.isRequired
};

export default BotRunTestStatusList;
