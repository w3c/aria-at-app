import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../common/BasicModal';
import AssignTesterDropdown from '../TestQueue/AssignTesterDropdown';
import { useMutation, useQuery } from '@apollo/client';
import {
    COLLECTION_JOB_ID_BY_TEST_PLAN_RUN_ID_QUERY,
    DELETE_TEST_PLAN_RUN,
    TEST_PLAN_REPORT_ASSIGNED_TESTERS_QUERY
} from './queries';
import DeleteButton from '../common/DeleteButton';
import { isBot } from '../../utils/automation';

import './ManageBotRunDialog.css';
import MarkBotRunFinishedButton from './MarkBotRunFinishedButton';
import RetryCancelledCollectionsButton from './RetryCancelledCollectionsButton';
import StopRunningCollectionButton from './StopRunningCollectionButton';

const ManageBotRunDialog = ({
    testPlanReportId,
    testPlanRun,
    testers,
    show,
    setShow,
    onChange
}) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { data: collectionJobQuery } = useQuery(
        COLLECTION_JOB_ID_BY_TEST_PLAN_RUN_ID_QUERY,
        {
            variables: {
                testPlanRunId: testPlanRun.id
            },
            fetchPolicy: 'cache-and-network'
        }
    );

    const [deleteTestPlanRun] = useMutation(DELETE_TEST_PLAN_RUN, {
        variables: {
            testPlanReportId: testPlanReportId,
            userId: testPlanRun.tester.id
        }
    });

    const { data: testPlanReportAssignedTestersQuery } = useQuery(
        TEST_PLAN_REPORT_ASSIGNED_TESTERS_QUERY,
        {
            variables: {
                testPlanReportId
            },
            fetchPolicy: 'cache-and-network'
        }
    );

    const possibleReassignees = useMemo(
        () =>
            testers.filter(
                t =>
                    !isBot(t) &&
                    !testPlanReportAssignedTestersQuery?.testPlanReport.draftTestPlanRuns.some(
                        d => d.tester.id === t.id
                    )
            ),
        [testers, testPlanReportAssignedTestersQuery]
    );

    const actions = useMemo(() => {
        return [
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
                component: StopRunningCollectionButton,
                props: {
                    collectionJob:
                        collectionJobQuery?.collectionJobByTestPlanRunId,
                    onClick: onChange
                }
            },
            {
                component: RetryCancelledCollectionsButton,
                props: {
                    collectionJob:
                        collectionJobQuery?.collectionJobByTestPlanRunId,
                    onClick: onChange
                }
            },
            {
                component: MarkBotRunFinishedButton,
                props: {
                    testPlanRun: testPlanRun,
                    onClick: onChange
                }
            },
            {
                component: DeleteButton,
                props: {
                    ariaLabel: 'Delete bot run',
                    onClick: () => setShowDeleteDialog(true)
                }
            }
        ];
    }, [testPlanReportId, testPlanRun, possibleReassignees, onChange]);
    const deleteConfirmationContent = (
        <>
            <p>
                The test plan run for <b>{testPlanRun.tester.username}</b> will
                be deleted:
            </p>
            <p>
                <b>Please press Delete to confirm this action.</b>
            </p>
        </>
    );

    return (
        <>
            <BasicModal
                show={showDeleteDialog}
                handleHide={() => setShowDeleteDialog(false)}
                useOnHide={true}
                cancelButton={true}
                title={`You are about to delete the run for ${testPlanRun.tester?.username}`}
                content={deleteConfirmationContent}
                actions={[
                    {
                        label: 'Delete',
                        variant: 'danger',
                        onClick: async () => {
                            await deleteTestPlanRun();
                            await onChange();
                            setShowDeleteDialog(false);
                        }
                    }
                ]}
            />
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
        </>
    );
};

ManageBotRunDialog.propTypes = {
    testPlanRun: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    testers: PropTypes.array.isRequired,
    testPlanReportId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default ManageBotRunDialog;
