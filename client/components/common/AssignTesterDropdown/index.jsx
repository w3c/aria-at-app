import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import {
  ASSIGN_TESTER_MUTATION,
  REMOVE_TESTER_MUTATION,
  TEST_PLAN_REPORT_AT_BROWSER_QUERY
} from './queries';
import { useMutation, useQuery } from '@apollo/client';
import { LoadingStatus, useTriggerLoad } from '../LoadingStatus';
import { SCHEDULE_COLLECTION_JOB_MUTATION } from '../../AddTestToQueueWithConfirmation/queries';
import { isSupportedByResponseCollector } from '../../../utils/automation';
import { TestPlanRunPropType, UserPropType } from '../proptypes';
import testQueueStyles from '../../TestQueue/TestQueue.module.css';

const AssignTesterDropdown = ({
  testPlanReportId,
  testPlanRun,
  draftTestPlanRuns,
  possibleTesters,
  onChange,
  label,
  srLabel = 'Assign Testers',
  faAssignIcon = faUser,
  disabled = false,
  dropdownAssignTesterButtonRef,
  setAlertMessage = () => {}
}) => {
  const { triggerLoad, loadingMessage } = useTriggerLoad();

  const { data: testPlanReportAtBrowserQuery } = useQuery(
    TEST_PLAN_REPORT_AT_BROWSER_QUERY,
    {
      variables: {
        testPlanReportId: testPlanReportId
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    }
  );

  const [removeTester] = useMutation(REMOVE_TESTER_MUTATION, {
    refetchQueries: ['TestQueuePage']
  });
  const [assignTester] = useMutation(ASSIGN_TESTER_MUTATION, {
    refetchQueries: ['TestQueuePage']
  });
  const [scheduleCollection] = useMutation(SCHEDULE_COLLECTION_JOB_MUTATION, {
    refetchQueries: ['TestQueuePage']
  });

  const isTesterAssigned = username => {
    if (testPlanRun) {
      return testPlanRun.tester?.username === username;
    } else if (draftTestPlanRuns?.length) {
      return draftTestPlanRuns.some(
        testPlanRun => testPlanRun.tester?.username === username
      );
    } else {
      return false;
    }
  };

  const toggleTesterAssign = async username => {
    const testerIsAssigned = isTesterAssigned(username);
    const tester = possibleTesters.find(tester => tester.username === username);

    if (testerIsAssigned) {
      await triggerLoad(async () => {
        await removeTester({
          variables: {
            testReportId: testPlanReportId,
            testerId: tester.id
          }
        });
      }, `Updating Test Plan Assignees. Deleting Test Plan Run for ${tester.username}`);
    } else {
      if (tester.isBot) {
        await triggerLoad(async () => {
          await scheduleCollection({
            variables: {
              testPlanReportId: testPlanReportId
            }
          });
        }, 'Scheduling Collection Job');
      } else {
        await triggerLoad(async () => {
          await assignTester({
            variables: {
              testReportId: testPlanReportId,
              testerId: tester.id,
              testPlanRunId: testPlanRun?.id // if we are assigning to an existing test plan run, pass the id
            }
          });
        }, 'Updating Test Plan Assignees');
      }
    }
  };

  const renderLabel = () => {
    return (
      <>
        {label ? (
          <span className={testQueueStyles.dropdownButtonLabel}>{label}</span>
        ) : (
          <>
            <span className="sr-only">{srLabel}</span>
            <FontAwesomeIcon icon={faAssignIcon} />
          </>
        )}
      </>
    );
  };

  const clearAriaLiveRegion = () => {
    setAlertMessage('');
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

  const renderDropdownItem = ({ tester }) => {
    const { id, username, isBot, ats } = tester;
    const testerIsAssigned = isTesterAssigned(username);

    if (isBot) {
      // if our bot doesn't have a link to the at - hide it from the list
      if (
        !ats.find(
          ({ id }) => id === testPlanReportAtBrowserQuery?.testPlanReport.at.id
        )
      ) {
        return null;
      }

      const supportedByBot = isSupportedByResponseCollector(
        testPlanReportAtBrowserQuery?.testPlanReport
      );
      if (!supportedByBot) {
        return null;
      }
    }

    let icon;
    if (testerIsAssigned) icon = faCheck;
    else if (isBot) icon = faRobot;

    return (
      <Dropdown.Item
        key={id}
        eventKey={id}
        as="button"
        role="menuitemcheckbox"
        variant="secondary"
        aria-checked={testerIsAssigned}
        onClick={async () => {
          const updatedIsAssigned = !testerIsAssigned;
          setAlertMessage(
            `${username} ${
              updatedIsAssigned
                ? 'now checked'
                : `now unchecked. ${tester.username}'s test plan run has been deleted.`
            }`
          );
          setTimeout(clearAriaLiveRegion, 6000);
          await toggleTesterAssign(username);
          await onChange();
        }}
      >
        <span>
          {icon && <FontAwesomeIcon icon={icon} />}
          {`${tester.username}`}
        </span>
      </Dropdown.Item>
    );
  };

  return (
    <LoadingStatus message={loadingMessage}>
      <div className={testQueueStyles.assignTestersContainer}>
        <Dropdown
          focusFirstItemOnShow
          aria-label={`${srLabel} menu`}
          onKeyDown={onKeyDown}
        >
          <Dropdown.Toggle
            ref={dropdownAssignTesterButtonRef}
            aria-label={srLabel}
            variant="secondary"
            disabled={disabled}
            className={testQueueStyles.assignTestersDropdownButton}
          >
            {renderLabel()}
          </Dropdown.Toggle>
          <Dropdown.Menu role="menu">
            {possibleTesters?.length ? (
              possibleTesters.map(tester => renderDropdownItem({ tester }))
            ) : (
              <span>No testers to assign</span>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </LoadingStatus>
  );
};

AssignTesterDropdown.propTypes = {
  testPlanReportId: PropTypes.string.isRequired,
  possibleTesters: PropTypes.arrayOf(UserPropType).isRequired,
  onChange: PropTypes.func.isRequired,
  testPlanRun: TestPlanRunPropType,
  label: PropTypes.string,
  srLabel: PropTypes.string,
  faAssignIcon: PropTypes.any,
  draftTestPlanRuns: PropTypes.arrayOf(TestPlanRunPropType),
  setAlertMessage: PropTypes.func,
  dropdownAssignTesterButtonRef: PropTypes.object,
  disabled: PropTypes.bool
};

export default AssignTesterDropdown;
