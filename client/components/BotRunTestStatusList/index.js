import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    COLLECTION_JOB_STATUS_BY_TEST_PLAN_RUN_ID_QUERY,
    TEST_PLAN_RUNS_TEST_RESULTS_QUERY
} from './queries';
import { useLazyQuery, useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import ReportStatusDot from '../common/ReportStatusDot';

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
        pollInterval: 750
    });

    const [getCollectionJobStatus, { data: collectionJobStatusQueryResult }] =
        useLazyQuery(COLLECTION_JOB_STATUS_BY_TEST_PLAN_RUN_ID_QUERY, {
            fetchPolicy: 'cache-and-network'
        });

    const [collectedData, setCollectedData] = useState([]);

    useEffect(() => {
        if (testPlanRunsQueryResult && testPlanRunsQueryResult.testPlanRuns) {
            const ids = testPlanRunsQueryResult.testPlanRuns.map(run => run.id);

            if (collectionJobStatusQueryResult) {
                setCollectedData(prev => [
                    ...prev,
                    collectionJobStatusQueryResult?.collectionJobByTestPlanRunId
                        ?.status
                ]);
            }

            for (const id of ids) {
                getCollectionJobStatus({ variables: { testPlanRunId: id } });
            }
        }
    }, [testPlanRunsQueryResult, collectionJobStatusQueryResult]);

    const [numTestsCompleted, numTestsQueued, numTestsCancelled] =
        useMemo(() => {
            const res = [0, 0, 0];
            if (
                testPlanRunsQueryResult &&
                testPlanRunsQueryResult.testPlanRuns
            ) {
                const { testPlanRuns } = testPlanRunsQueryResult;
                for (let i = 0; i < testPlanRuns.length; i++) {
                    const status = collectedData[i];
                    res[0] += testPlanRuns[i].testResults.length;
                    switch (status) {
                        case 'COMPLETED':
                        case 'RUNNING':
                            res[1] +=
                                runnableTestsLength -
                                testPlanRuns[i].testResults.length;
                            break;
                        case 'CANCELLED':
                            res[2] +=
                                runnableTestsLength -
                                testPlanRuns[i].testResults.length;
                            break;
                        default:
                            break;
                    }
                }
                if (
                    res[0] + res[2] ===
                    runnableTestsLength *
                        testPlanRunsQueryResult.testPlanRuns.length
                ) {
                    stopPolling();
                }
            }
            return res;
        }, [testPlanRunsQueryResult, collectedData, stopPolling, startPolling]);

    if (!testPlanRunsQueryResult) {
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
