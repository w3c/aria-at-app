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

    const filteredTestPlanRuns = useMemo(() => {
        if (!testPlanRunsQueryResult?.testPlanRuns) {
            return [];
        }
        return testPlanRunsQueryResult.testPlanRuns.filter(testPlanRun =>
            isBot(testPlanRun.tester)
        );
    }, [testPlanRunsQueryResult?.testPlanRuns]);

    useEffect(() => {
        if (filteredTestPlanRuns && filteredTestPlanRuns.length > 0) {
            const ids = filteredTestPlanRuns.map(run => run.id);
            for (const id of ids) {
                if (!requestedTestRunIds.current.has(id)) {
                    requestedTestRunIds.current.add(id);
                    getCollectionJobStatus({
                        variables: { testPlanRunId: id }
                    });
                }
            }
        }
    }, [filteredTestPlanRuns]);

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
                filteredTestPlanRuns &&
                filteredTestPlanRuns.length &&
                collectedData.length === filteredTestPlanRuns.length
            ) {
                for (let i = 0; i < filteredTestPlanRuns.length; i++) {
                    const status = collectedData[i];
                    res[0] += filteredTestPlanRuns[i].testResults.length;
                    switch (status) {
                        case 'COMPLETED':
                        case 'RUNNING':
                            res[1] +=
                                runnableTestsLength -
                                filteredTestPlanRuns[i].testResults.length;
                            break;
                        case 'CANCELLED':
                            res[2] +=
                                runnableTestsLength -
                                filteredTestPlanRuns[i].testResults.length;
                            break;
                        default:
                            break;
                    }
                }
                if (
                    res[0] + res[2] ===
                    runnableTestsLength * filteredTestPlanRuns.length
                ) {
                    stopPolling();
                }
            }
            return res;
        }, [testPlanRunsQueryResult, collectedData, stopPolling, startPolling]);

    if (
        !filteredTestPlanRuns ||
        filteredTestPlanRuns.length === 0 ||
        !collectedData ||
        !(collectedData.length === filteredTestPlanRuns.length)
    ) {
        return null;
    }
    return (
        <BotRunTestStatusUnorderedList className="text-secondary fs-6">
            <li className="m-2">
                <ReportStatusDot className="tests-complete" />
                {numTestsCompleted} Tests Completed
            </li>
            <li className="m-2">
                <ReportStatusDot className="tests-queued" />
                {numTestsQueued} Tests Queued
            </li>
            <li className="m-2">
                <ReportStatusDot className="tests-cancelled" />
                {numTestsCancelled} Tests Cancelled
            </li>
        </BotRunTestStatusUnorderedList>
    );
};

BotRunTestStatusList.propTypes = {
    testPlanReportId: PropTypes.string.isRequired,
    runnableTestsLength: PropTypes.number.isRequired
};

export default BotRunTestStatusList;
