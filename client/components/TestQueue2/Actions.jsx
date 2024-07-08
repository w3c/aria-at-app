import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import useConfirmationModal from '../../hooks/useConfirmationModal';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import { useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { Button, Dropdown, Form } from 'react-bootstrap';
import BasicModal from '../common/BasicModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquareCheck,
  faFileImport,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import {
  MARK_TEST_PLAN_REPORT_AS_FINAL_MUTATION,
  REMOVE_TEST_PLAN_REPORT_MUTATION,
  TEST_QUEUE_PAGE_QUERY
} from './queries';
import useForceUpdate from '../../hooks/useForceUpdate';
import BasicThemedModal from '../common/BasicThemedModal';
import { evaluateAuth } from '../../utils/evaluateAuth';
import { TEST_PLAN_REPORT_STATUS_DIALOG_QUERY } from '../TestPlanReportStatusDialog/queries';
import ManageBotRunDialogWithButton from '@components/ManageBotRunDialog/WithButton';

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Actions = ({
  me,
  testPlan,
  testPlanReport,
  testers = [],
  triggerUpdate = () => {}
}) => {
  const primaryRunIdRef = useRef({});

  const { showConfirmationModal, hideConfirmationModal } =
    useConfirmationModal();

  const { triggerLoad, loadingMessage } = useTriggerLoad();

  const forceUpdate = useForceUpdate();

  const client = useApolloClient();

  const { isAdmin, isTester } = evaluateAuth(me);

  const selfAssignedRun =
    me &&
    testPlanReport.draftTestPlanRuns.find(
      testPlanRun => testPlanRun.tester.id === me.id
    );

  const nonSelfAssignedRuns = testPlanReport.draftTestPlanRuns
    .filter(testPlanRun => testPlanRun.tester.id !== me?.id)
    .sort((a, b) => a.tester.username.localeCompare(b.tester.username));

  const completedAllTests = testPlanReport.draftTestPlanRuns.every(
    testPlanRun =>
      testPlanRun.testResultsLength === testPlanReport.runnableTestsLength
  );

  const assignedBotRun = testPlanReport.draftTestPlanRuns.find(
    testPlanRun => testPlanRun.tester.isBot
  );

  const canMarkAsFinal =
    !assignedBotRun &&
    !testPlanReport.conflictsLength &&
    testPlanReport.draftTestPlanRuns.length > 0 &&
    testPlanReport.draftTestPlanRuns[0].testResultsLength > 0 &&
    completedAllTests;

  const markAsFinal = () => {
    const runs = testPlanReport.draftTestPlanRuns;

    primaryRunIdRef.current = runs[0].id;

    const onChangePrimary = event => {
      const id = event.target.value;
      primaryRunIdRef.current = id;
      forceUpdate();
    };

    const onConfirm = async () => {
      await triggerLoad(async () => {
        await client.mutate({
          mutation: MARK_TEST_PLAN_REPORT_AS_FINAL_MUTATION,
          refetchQueries: [
            TEST_QUEUE_PAGE_QUERY,
            TEST_PLAN_REPORT_STATUS_DIALOG_QUERY
          ],
          awaitRefetchQueries: true,
          variables: {
            testPlanReportId: testPlanReport.id,
            primaryTestPlanRunId: primaryRunIdRef.current
          }
        });
      }, 'Marking as Final ...');

      hideConfirmationModal();
    };

    let title;
    let content;

    if (runs.length === 1) {
      title =
        "Are you sure you want to mark as final with a single tester's results?";
      content = (
        <>
          <p>
            Only {runs[0].tester.username}&apos;s results are included in this
            report, so their run will be marked as the primary run. Only their
            output will be displayed on report pages.
          </p>
          <p>
            Their run being marked as primary may also set the minimum required
            Assistive Technology Version that can be used for subsequent reports
            with this Test Plan Version and Assistive Technology combination.
          </p>
        </>
      );
    } else {
      // Multiple testers runs to choose from
      title = 'Select Primary Test Plan Run';
      content = (
        <>
          <p>
            When a tester&apos;s run is marked as primary, it means that their
            output for collected results will be prioritized and shown on report
            pages.
          </p>
          <p>
            A tester&apos;s run being marked as primary may also set the minimum
            required Assistive Technology Version that can be used for
            subsequent reports with that Test Plan Version and Assistive
            Technology combination.
          </p>
          <Form.Select
            className="primary-test-run-select"
            defaultValue={runs[0].id}
            onChange={onChangePrimary}
            htmlSize={runs.length}
          >
            {runs.map(run => (
              <option key={`${testPlanReport.id}-${run.id}`} value={run.id}>
                {run.tester.username}
              </option>
            ))}
          </Form.Select>
        </>
      );
    }

    showConfirmationModal(
      <BasicModal
        show
        title={title}
        content={content}
        closeLabel="Cancel"
        staticBackdrop={true}
        actions={[
          {
            label: 'Confirm',
            onClick: onConfirm
          }
        ]}
      />
    );
  };

  const deleteReport = () => {
    const onConfirm = async () => {
      await triggerLoad(async () => {
        await client.mutate({
          mutation: REMOVE_TEST_PLAN_REPORT_MUTATION,
          refetchQueries: [
            TEST_QUEUE_PAGE_QUERY,
            TEST_PLAN_REPORT_STATUS_DIALOG_QUERY
          ],
          awaitRefetchQueries: true,
          variables: { testPlanReportId: testPlanReport.id }
        });
      }, 'Deleting...');

      hideConfirmationModal();

      setTimeout(() => {
        const focusTarget =
          document.querySelector(`h2#${testPlan.directory}`) ??
          document.querySelector('#main');

        focusTarget.focus();
      }, 1);
    };

    showConfirmationModal(
      <BasicThemedModal
        show
        closeButton={false}
        theme="danger"
        title="Deleting Report"
        content={
          `Are you sure you want to permanently delete this ` +
          `report and all its runs? This cannot be undone.`
        }
        actionButtons={[
          {
            text: 'Proceed',
            action: onConfirm
          }
        ]}
        closeLabel="Cancel"
        handleClose={() => hideConfirmationModal()}
      />
    );
  };

  return (
    <LoadingStatus message={loadingMessage}>
      <ActionContainer>
        {!isTester && (
          <Button
            variant="primary"
            href={`/test-plan-report/${testPlanReport.id}`}
          >
            View Tests
          </Button>
        )}
        {isTester && (
          <Button
            variant="primary"
            disabled={!selfAssignedRun}
            href={selfAssignedRun ? `/run/${selfAssignedRun.id}` : undefined}
          >
            {selfAssignedRun?.testResultsLength
              ? 'Continue Testing'
              : 'Start Testing'}
          </Button>
        )}
        {isAdmin && (
          <Dropdown focusFirstItemOnShow>
            <Dropdown.Toggle
              variant="secondary"
              disabled={!nonSelfAssignedRuns.length}
            >
              <FontAwesomeIcon icon={faFileImport} />
              Open run as...&nbsp;
            </Dropdown.Toggle>
            <Dropdown.Menu role="menu">
              {nonSelfAssignedRuns.map(testPlanRun => (
                <Dropdown.Item
                  key={testPlanRun.id}
                  role="menuitem"
                  href={`/run/${testPlanRun.id}?user=${testPlanRun.tester.id}`}
                >
                  {testPlanRun.tester.username}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
        {isAdmin && assignedBotRun && (
          <ManageBotRunDialogWithButton
            testPlanRun={assignedBotRun}
            testPlanReportId={testPlanReport.id}
            runnableTestsLength={testPlanReport.runnableTestsLength}
            testers={testers}
            onChange={triggerUpdate}
            includeIcon
          />
        )}
        {isAdmin && (
          <Button
            disabled={!canMarkAsFinal}
            variant="secondary"
            onClick={markAsFinal}
          >
            <FontAwesomeIcon icon={faSquareCheck} />
            Mark as Final
          </Button>
        )}
        {isAdmin && (
          <Button variant="secondary" onClick={deleteReport}>
            <FontAwesomeIcon icon={faTrashAlt} />
            Delete Report
          </Button>
        )}
      </ActionContainer>
    </LoadingStatus>
  );
};

Actions.propTypes = {
  me: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired
  }),
  testPlan: PropTypes.shape({
    directory: PropTypes.string.isRequired
  }).isRequired,
  testPlanReport: PropTypes.shape({
    id: PropTypes.string.isRequired,
    runnableTestsLength: PropTypes.number.isRequired,
    conflictsLength: PropTypes.number.isRequired,
    draftTestPlanRuns: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        testResultsLength: PropTypes.number.isRequired,
        tester: PropTypes.shape({
          id: PropTypes.string.isRequired,
          username: PropTypes.string.isRequired,
          isBot: PropTypes.bool.isRequired
        })
      })
    ).isRequired
  }).isRequired,
  testers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      isBot: PropTypes.bool.isRequired,
      ats: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          key: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired,
  triggerUpdate: PropTypes.func.isRequired
};

export default Actions;
