import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../common/BasicModal';
import AssignTesterDropdown from '../common/AssignTesterDropdown';
import { useMutation, useQuery } from '@apollo/client';
import {
  COLLECTION_JOB_ID_BY_TEST_PLAN_RUN_ID_QUERY,
  DELETE_TEST_PLAN_RUN,
  TEST_PLAN_REPORT_ASSIGNED_TESTERS_QUERY
} from './queries';
import DeleteButton from '../common/DeleteButton';
import BotRunTestStatusList from '../BotRunTestStatusList';

import './ManageBotRunDialog.css';
import MarkBotRunFinishedButton from './MarkBotRunFinishedButton';
import RetryCanceledCollectionsButton from './RetryCanceledCollectionsButton';
import StopRunningCollectionButton from './StopRunningCollectionButton';
import ViewLogsButton from './ViewLogsButton';
import { TestPlanRunPropType, UserPropType } from '../common/proptypes';
import { COLLECTION_JOB_STATUS } from '../../utils/collectionJobStatus';

const ManageBotRunDialog = ({
  testPlanReportId,
  runnableTestsLength,
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
          !t.isBot &&
          !testPlanReportAssignedTestersQuery?.testPlanReport.draftTestPlanRuns.some(
            d => d.tester.id === t.id
          )
      ),
    [testers, testPlanReportAssignedTestersQuery]
  );

  const isBotRunFinished = useMemo(() => {
    const status = collectionJobQuery?.collectionJobByTestPlanRunId?.status;
    if (!status) return false;
    switch (status) {
      case COLLECTION_JOB_STATUS.COMPLETED:
      case COLLECTION_JOB_STATUS.ERROR:
      case COLLECTION_JOB_STATUS.CANCELLED:
        return true;
      default:
        return false;
    }
  }, [collectionJobQuery]);

  const actions = useMemo(() => {
    return [
      {
        component: AssignTesterDropdown,
        props: {
          testPlanReportId: testPlanReportId,
          testPlanRun: testPlanRun,
          possibleTesters: possibleReassignees,
          label: 'Assign To ...',
          disabled: !isBotRunFinished,
          onChange
        }
      },
      {
        component: ViewLogsButton,
        props: {
          externalLogsUrl:
            collectionJobQuery?.collectionJobByTestPlanRunId?.externalLogsUrl
        }
      },
      {
        component: StopRunningCollectionButton,
        props: {
          collectionJob: collectionJobQuery?.collectionJobByTestPlanRunId,
          onClick: onChange
        }
      },
      {
        component: RetryCanceledCollectionsButton,
        props: {
          collectionJob: collectionJobQuery?.collectionJobByTestPlanRunId,
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
  }, [
    testPlanReportId,
    testPlanRun,
    possibleReassignees,
    onChange,
    collectionJobQuery
  ]);

  const deleteConfirmationContent = (
    <>
      <p>
        The test plan run for <b>{testPlanRun.tester.username}</b> will be
        deleted.
      </p>
      <p>
        <b>Please press Delete to confirm this action.</b>
      </p>
    </>
  );
  const content = (
    <BotRunTestStatusList
      testPlanReportId={testPlanReportId}
      runnableTestsLength={runnableTestsLength}
    />
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
        content={content}
        dialogClassName="manage-bot-run-dialog"
        actions={actions}
      />
    </>
  );
};

ManageBotRunDialog.propTypes = {
  testPlanRun: TestPlanRunPropType.isRequired,
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  testers: PropTypes.arrayOf(UserPropType).isRequired,
  testPlanReportId: PropTypes.string.isRequired,
  runnableTestsLength: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default ManageBotRunDialog;
