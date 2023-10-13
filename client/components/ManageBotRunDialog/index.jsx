import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../common/BasicModal';
import AssignTesterDropdown from '../TestQueue/AssignTesterDropdown';
import { useMutation, useQuery } from '@apollo/client';
import {
    COLLECTION_JOB_ID_BY_TEST_PLAN_RUN_ID_QUERY,
    MARK_COLLECTION_JOB_AS_FINISHED
} from './queries';
import DeleteButton from '../common/DeleteButton';
import { isBot } from '../../utils/automation';

import './ManageBotRunDialog.css';

const ManageBotRunDialog = ({
    testPlanReportId,
    testPlanRun,
    testers,
    show,
    setShow,
    onChange,
    onDelete
}) => {
    const { data: collectionJobQuery } = useQuery(
        COLLECTION_JOB_ID_BY_TEST_PLAN_RUN_ID_QUERY,
        {
            variables: {
                testPlanRunId: testPlanRun.id
            },
            fetchPolicy: 'cache-and-network'
        }
    );

    const [markCollectionJobFinished] = useMutation(
        MARK_COLLECTION_JOB_AS_FINISHED,
        {
            variables: {
                collectionJobId:
                    collectionJobQuery?.collectionJobByTestPlanRunId?.id
            }
        }
    );

    const possibleReassignees = useMemo(
        () => testers.filter(t => !isBot(t)),
        [testers]
    );

    const runIsFinished = useMemo(
        () =>
            testPlanRun?.testResults?.every(
                testResult => testResult?.completedAt !== null
            ),
        [testPlanRun]
    );

    const actions = useMemo(() => {
        // Fill with always present actions first
        const _actions = [
            {
                component: AssignTesterDropdown,
                props: {
                    testPlanReportId: testPlanReportId,
                    testPlanRun: testPlanRun,
                    possibleTesters: possibleReassignees,
                    label: 'Assign To ...',
                    onChange
                }
            },
            {
                label: 'Stop Running',
                // TODO: enabled when a job is queued
                variant: 'secondary',
                onClick: async () => {
                    if (markCollectionJobFinished) {
                        await markCollectionJobFinished();
                    }
                    await onChange();
                }
            },
            {
                label: 'Retry cancelled collections',
                // TODO: enabled when all jobs are either cancelled or completed
                variant: 'secondary',
                onClick: async () => {
                    // TODO: retry cancelled collections
                    await onChange();
                }
            }
        ];
        if (runIsFinished) {
            _actions.push({
                label: 'Mark as not finished',
                variant: 'secondary',
                onClick: async () => {
                    // TODO: unmark all test results as finished
                    // if this is possible
                }
            });
        } else {
            _actions.push({
                label: 'Mark as finished',
                variant: 'secondary',
                onClick: async () => {
                    // TODO: resubmit all test results as finished
                }
            });
        }
        _actions.push({
            component: DeleteButton,
            props: {
                ariaLabel: 'Delete bot run',
                onClick: onDelete
            }
        });
        return _actions;
    }, [
        testPlanReportId,
        testPlanRun,
        possibleReassignees,
        onChange,
        markCollectionJobFinished
    ]);

    return (
        <BasicModal
            show={show}
            handleHide={() => setShow(false)}
            useOnHide={true}
            title={`Manage ${testPlanRun.tester?.username} Run`}
            cancelButton={false}
            content=""
            dialogClassName="manage-bot-run-dialog"
            actions={actions}
        />
    );
};

ManageBotRunDialog.propTypes = {
    testPlanRun: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    testers: PropTypes.array.isRequired,
    testPlanReportId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default ManageBotRunDialog;
