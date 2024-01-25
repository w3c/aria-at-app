import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    COLLECTION_JOB_STATUS_BY_TEST_PLAN_RUN_ID_QUERY,
    TEST_PLAN_RUNS_TEST_RESULTS_QUERY
} from './queries';
import { useLazyQuery, useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import ReportStatusDot from '../common/ReportStatusDot';
import { isBot } from '../../utils/automation';

const BotRunTestStatusUnorderedList = styled.ul`
    list-style-type: none;
    background-color: #f6f8fa;
    font-size: 0.9rem !important;
    padding: 0.5rem 0;
    margin: 0.5rem 0;
    white-space: nowrap;
`;

/**
 * Generate a string describing some number of "Tests" where the word "Test" is
 * pluralized appropriately (and without interstitial space characters which
 * produces unnatural speech in some screen readers [1]).
 *
 * [1]: https://github.com/w3c/aria-at-app/issues/872
 *
 * @param {number} count the integer number of tests being described
 *
 * @returns {string} the pluralized text
 */
const testCountString = (count) => `${count} Test${count === 1 ? '' : 's'}`;

const BotRunTestStatusList = ({ testPlanReportId, runnableTestsLength }) => {
    const {
        data: testPlanRunsQueryResult,
        startPolling,
        stopPolling
    } = useQuery(TEST_PLAN_RUNS_TEST_RESULTS_QUERY, {
        variables: { testPlanReportId },
        fetchPolicy: 'cache-and-network',
        pollInterval: 2000
    });

    const [getCollectionJobStatus, { data: collectionJobStatusQueryResult }] =
        useLazyQuery(COLLECTION_JOB_STATUS_BY_TEST_PLAN_RUN_ID_QUERY, {
            fetchPolicy: 'cache-and-network'
        });

    const [collectedData, setCollectedData] = useState([]);
    const requestedTestRunIds = useRef(new Set());

    const botTestPlanRuns = useMemo(() => {
        if (!testPlanRunsQueryResult?.testPlanRuns) {
            return [];
        }
        return testPlanRunsQueryResult.testPlanRuns.filter(testPlanRun =>
            isBot(testPlanRun.tester)
        );
    }, [testPlanRunsQueryResult?.testPlanRuns]);

    useEffect(() => {
        const ids = botTestPlanRuns.map(run => run.id);
        for (const id of ids) {
            if (!requestedTestRunIds.current.has(id)) {
                requestedTestRunIds.current.add(id);
                getCollectionJobStatus({
                    variables: { testPlanRunId: id }
                });
            }
        }
    }, [botTestPlanRuns]);

    useEffect(() => {
        if (collectionJobStatusQueryResult?.collectionJobByTestPlanRunId) {
            const { status } =
                collectionJobStatusQueryResult.collectionJobByTestPlanRunId;
            setCollectedData(prev => [...prev, status]);
        }
    }, [collectionJobStatusQueryResult?.collectionJobByTestPlanRunId]);

    const [numTestsCompleted, numTestsQueued, numTestsCancelled] =
        useMemo(() => {
            const res = [0, 0, 0];
            if (
                botTestPlanRuns &&
                botTestPlanRuns.length &&
                collectedData.length === botTestPlanRuns.length
            ) {
                for (let i = 0; i < botTestPlanRuns.length; i++) {
                    const status = collectedData[i];
                    res[0] += botTestPlanRuns[i].testResults.length;
                    switch (status) {
                        case 'COMPLETED':
                        case 'RUNNING':
                        case 'QUEUED':
                            res[1] +=
                                runnableTestsLength -
                                botTestPlanRuns[i].testResults.length;
                            break;
                        case 'CANCELLED':
                            res[2] +=
                                runnableTestsLength -
                                botTestPlanRuns[i].testResults.length;
                            break;
                        default:
                            break;
                    }
                }
                if (
                    res[0] + res[2] ===
                    runnableTestsLength * botTestPlanRuns.length
                ) {
                    stopPolling();
                }
            }
            return res;
        }, [testPlanRunsQueryResult, collectedData, stopPolling, startPolling]);

    if (
        !botTestPlanRuns ||
        botTestPlanRuns.length === 0 ||
        !collectedData ||
        !(collectedData.length === botTestPlanRuns.length)
    ) {
        return null;
    }
    return (
        <BotRunTestStatusUnorderedList className="text-secondary fs-6">
            <li className="m-2">
                <ReportStatusDot className="tests-complete" />
                {testCountString(numTestsCompleted)} Completed
            </li>
            <li className="m-2">
                <ReportStatusDot className="tests-queued" />
                {testCountString(numTestsQueued)} Queued
            </li>
            <li className="m-2">
                <ReportStatusDot className="tests-cancelled" />
                {testCountString(numTestsCancelled)} Cancelled
            </li>
        </BotRunTestStatusUnorderedList>
    );
};

BotRunTestStatusList.propTypes = {
    testPlanReportId: PropTypes.string.isRequired,
    runnableTestsLength: PropTypes.number.isRequired
};

export default BotRunTestStatusList;
