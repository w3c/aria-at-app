import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faChevronDown,
  faRobot,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import {
  ASSIGN_TESTER_MUTATION,
  REMOVE_TESTER_MUTATION,
  TEST_PLAN_REPORT_AT_BROWSER_QUERY
} from './queries';
import { useMutation, useQuery } from '@apollo/client';
import { LoadingStatus, useTriggerLoad } from '../LoadingStatus';
import { SCHEDULE_COLLECTION_JOB_MUTATION } from '../../AddTestToQueueWithConfirmation/queries';
import { isSupportedByResponseCollector } from '../../../utils/automation';

import './AssignTesterDropdown.css';

const AssignTesterDropdown = ({
  testPlanReportId,
  testPlanRun,
  draftTestPlanRuns,
  possibleTesters,
  onChange,
  label,
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
      fetchPolicy: 'cache-and-network'
    }
  );

  const [removeTester] = useMutation(REMOVE_TESTER_MUTATION);
  const [assignTester] = useMutation(ASSIGN_TESTER_MUTATION);
  const [scheduleCollection] = useMutation(SCHEDULE_COLLECTION_JOB_MUTATION);

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
    if (label) {
      return (
        <span>
          {label} <FontAwesomeIcon icon={faChevronDown} />
        </span>
      );
    } else {
      return <FontAwesomeIcon icon={faUserPlus} />;
    }
  };
  const clearAriaLiveRegion = () => {
    setAlertMessage('');
  };

  const handleKeyDown = event => {
    const { key } = event;
    if (key.match(/[0-9a-zA-Z]/)) {
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

  return (
    <LoadingStatus message={loadingMessage}>
      <Dropdown
        focusFirstItemOnShow
        aria-label="Assign testers menu"
        onKeyDown={handleKeyDown}
      >
        <Dropdown.Toggle
          ref={dropdownAssignTesterButtonRef}
          aria-label="Assign testers"
          className="assign-tester"
          variant="secondary"
        >
          {renderLabel()}
        </Dropdown.Toggle>
        <Dropdown.Menu role="menu" className="assign-menu">
          {possibleTesters?.length ? (
            possibleTesters.map(tester => {
              const { username, isBot, ats } = tester;
              const testerIsAssigned = isTesterAssigned(username);
              const classname = [
                testerIsAssigned ? 'assigned' : 'not-assigned',
                isBot ? 'bot' : 'human'
              ].join(' ');
              let icon;
              if (testerIsAssigned) {
                icon = faCheck;
              } else if (isBot) {
                // if our bot doesn't have a link to the at - hide it from the list
                if (
                  !ats.find(
                    ({ id }) =>
                      id === testPlanReportAtBrowserQuery?.testPlanReport.at.id
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
                icon = faRobot;
              }
              return (
                <Dropdown.Item
                  role="menuitemcheckbox"
                  variant="secondary"
                  as="button"
                  key={`tpr-${testPlanReportId}-assign-tester-${username}`}
                  aria-checked={testerIsAssigned ? true : false}
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
                  {icon && <FontAwesomeIcon icon={icon} />}
                  <span className={classname}>{`${tester.username}`}</span>
                </Dropdown.Item>
              );
            })
          ) : (
            <span className="not-assigned">No testers to assign</span>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </LoadingStatus>
  );
};

AssignTesterDropdown.propTypes = {
  testPlanReportId: PropTypes.string.isRequired,
  possibleTesters: PropTypes.arrayOf(
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
  onChange: PropTypes.func.isRequired,
  testPlanRun: PropTypes.object,
  label: PropTypes.string,
  draftTestPlanRuns: PropTypes.array,
  setAlertMessage: PropTypes.func,
  dropdownAssignTesterButtonRef: PropTypes.object
};

export default AssignTesterDropdown;
