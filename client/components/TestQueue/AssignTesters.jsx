import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useApolloClient } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import { Button, Dropdown } from 'react-bootstrap';
import CompletionStatusListItem from '../TestQueueCompletionStatusListItem';
import useConfirmationModal from '../../hooks/useConfirmationModal';
import BasicThemedModal from '../common/BasicThemedModal';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import { useAriaLiveRegion } from '../providers/AriaLiveRegionProvider';
import { evaluateAuth } from '../../utils/evaluateAuth';
import { isSupportedByResponseCollector } from '../../utils/automation';
import {
  ASSIGN_TESTER_MUTATION,
  DELETE_TEST_PLAN_RUN,
  TEST_QUEUE_PAGE_QUERY
} from './queries';
import { SCHEDULE_COLLECTION_JOB_MUTATION } from '../AddTestToQueueWithConfirmation/queries';
import { TEST_PLAN_REPORT_STATUS_DIALOG_QUERY } from '../TestPlanReportStatusDialog/queries';
import { TestPlanReportPropType, UserPropType } from '../common/proptypes';
import styles from './TestQueue.module.css';

const AssignTesters = ({ me, testers, testPlanReport }) => {
  const { triggerLoad, loadingMessage } = useTriggerLoad();

  const setAlertMessage = useAriaLiveRegion();

  const { showConfirmationModal, hideConfirmationModal } =
    useConfirmationModal();

  const client = useApolloClient();

  const dropdownButtonRef = useRef();
  const assignSelfButtonRef = useRef();

  const { isAdmin, isTester } = evaluateAuth(me);

  const isSelfAssigned =
    me &&
    testPlanReport.draftTestPlanRuns.some(
      testPlanRun => testPlanRun.tester.id === me.id
    );

  const onToggle = isShown => {
    setTimeout(() => {
      if (!isShown) return;
      document
        .querySelector(
          `#assign-testers-${testPlanReport.id} [role="menuitemcheckbox"]`
        )
        .focus();
    }, 1);
  };

  const onKeyDown = event => {
    const { key } = event;
    if (key.length === 1 && key.match(/[a-zA-Z0-9]/)) {
      const container = event.target.closest('[role=menu]');
      const matchingMenuItem = Array.from(container.children).find(menuItem => {
        return menuItem.innerText
          .trim()
          .toLowerCase()
          .startsWith(key.toLowerCase());
      });

      if (matchingMenuItem) {
        matchingMenuItem.focus();
      }
    }
  };

  const toggleTesterCommon = async ({
    testerId,
    assignedCallback,
    unassignedCallback
  }) => {
    const tester = testers.find(tester => tester.id === testerId);

    const isAssigned = testPlanReport.draftTestPlanRuns.some(
      testPlanRun => testPlanRun.tester.id === testerId
    );

    if (isAssigned) {
      const isSelfAssigned = tester.id === me.id;
      const testerFormatted = isSelfAssigned ? 'your' : `${tester.username}'s`;

      const onConfirm = async () => {
        await triggerLoad(async () => {
          await client.mutate({
            mutation: DELETE_TEST_PLAN_RUN,
            refetchQueries: [
              TEST_QUEUE_PAGE_QUERY,
              TEST_PLAN_REPORT_STATUS_DIALOG_QUERY
            ],
            awaitRefetchQueries: true,
            variables: {
              testReportId: testPlanReport.id,
              testerId: tester.id
            }
          });
        }, 'Deleting...');

        hideConfirmationModal();

        await assignedCallback?.({ tester });
      };

      showConfirmationModal(
        <BasicThemedModal
          show
          closeButton={false}
          theme="danger"
          title="Deleting Run"
          content={
            `Are you sure you want to permanently delete ` +
            `${testerFormatted} run? This cannot be undone.`
          }
          actionButtons={[{ text: 'Proceed', action: onConfirm }]}
          closeLabel="Cancel"
          handleClose={() => hideConfirmationModal()}
        />
      );

      return;
    }

    await triggerLoad(async () => {
      if (tester.isBot) {
        await client.mutate({
          mutation: SCHEDULE_COLLECTION_JOB_MUTATION,
          refetchQueries: [
            TEST_QUEUE_PAGE_QUERY,
            TEST_PLAN_REPORT_STATUS_DIALOG_QUERY
          ],
          awaitRefetchQueries: true,
          variables: {
            testPlanReportId: testPlanReport.id
          }
        });
      } else {
        await client.mutate({
          mutation: ASSIGN_TESTER_MUTATION,
          refetchQueries: [
            TEST_QUEUE_PAGE_QUERY,
            TEST_PLAN_REPORT_STATUS_DIALOG_QUERY
          ],
          awaitRefetchQueries: true,
          variables: {
            testReportId: testPlanReport.id,
            testerId: tester.id
          }
        });
      }
    }, 'Assigning...');

    await unassignedCallback?.({ tester });
  };

  const onSelect = testerId => {
    const assignedCallback = ({ tester }) => {
      setAlertMessage(`${tester.username}'s run has been deleted`);

      setTimeout(() => {
        dropdownButtonRef.current.focus();
      }, 1);
    };

    const unassignedCallback = ({ tester }) => {
      setAlertMessage(`Assigned ${tester.username}`);

      setTimeout(() => {
        dropdownButtonRef.current.focus();
      }, 1);
    };

    toggleTesterCommon({ testerId, assignedCallback, unassignedCallback });
  };

  const onToggleSelf = () => {
    const assignedCallback = () => {
      setTimeout(() => {
        assignSelfButtonRef.current.focus();
      }, 1);
    };

    toggleTesterCommon({
      testerId: me.id,
      assignedCallback
    });
  };

  const renderDropdownItem = ({ tester }) => {
    const { id, username, isBot, ats } = tester;

    if (isBot) {
      const foundAtForBot = ats.find(({ id }) => id === testPlanReport.at?.id);
      const supportedByResponseCollector = isSupportedByResponseCollector({
        id: testPlanReport.id,
        at: testPlanReport.at,
        browser: testPlanReport.browser,
        minimumAtVersion: testPlanReport.minimumAtVersion,
        exactAtVersion: testPlanReport.exactAtVersion
      });
      if (!foundAtForBot || !supportedByResponseCollector) return null;
    }

    const isAssigned = testPlanReport.draftTestPlanRuns.some(
      testPlanRun => testPlanRun.tester.username === username
    );

    let icon;
    if (isAssigned) icon = faCheck;
    else if (isBot) icon = faRobot;

    return (
      <Dropdown.Item
        key={id}
        eventKey={id}
        as="button"
        role="menuitemcheckbox"
        variant="secondary"
        aria-checked={isAssigned}
      >
        <span>
          {icon && <FontAwesomeIcon icon={icon} />}
          {`${username}`}
        </span>
      </Dropdown.Item>
    );
  };

  return (
    <LoadingStatus message={loadingMessage}>
      <div className={styles.assignTestersContainer}>
        {isAdmin && (
          <Dropdown
            id={`assign-testers-${testPlanReport.id}`}
            onToggle={onToggle}
            onSelect={onSelect}
            onKeyDown={onKeyDown}
          >
            <Dropdown.Toggle
              variant="secondary"
              ref={dropdownButtonRef}
              className={styles.assignTestersDropdownButton}
            >
              <span className="sr-only">Assign Testers</span>
              <FontAwesomeIcon icon={faUser} />
            </Dropdown.Toggle>
            <Dropdown.Menu role="menu">
              {testers.map(tester => renderDropdownItem({ tester }))}
            </Dropdown.Menu>
          </Dropdown>
        )}
        {isTester && (
          <Button
            variant="secondary"
            ref={assignSelfButtonRef}
            onClick={onToggleSelf}
          >
            {isSelfAssigned ? 'Unassign Yourself' : 'Assign Yourself'}
          </Button>
        )}
      </div>
      <ul className={styles.assignTestersList}>
        {testPlanReport.draftTestPlanRuns
          .slice()
          .sort((a, b) => a.tester.username.localeCompare(b.tester.username))
          .map((testPlanRun, index) => {
            const tester = testPlanRun.tester;
            const rowId = `plan-${testPlanReport.id}-assignee-${tester.id}-run-${testPlanRun.id}`;
            return (
              <React.Fragment key={rowId}>
                <CompletionStatusListItem
                  rowId={rowId}
                  testPlanReport={testPlanReport}
                  testPlanRun={testPlanRun}
                  tester={tester}
                />
                {index ===
                testPlanReport.draftTestPlanRuns.length - 1 ? null : (
                  <br />
                )}
              </React.Fragment>
            );
          })}
      </ul>
    </LoadingStatus>
  );
};

AssignTesters.propTypes = {
  me: UserPropType,
  testers: PropTypes.arrayOf(UserPropType).isRequired,
  testPlanReport: TestPlanReportPropType.isRequired
};

export default AssignTesters;
