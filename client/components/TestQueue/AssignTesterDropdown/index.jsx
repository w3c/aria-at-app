import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faChevronDown,
    faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { ASSIGN_TESTER_MUTATION, REMOVE_TESTER_MUTATION } from '../queries';
import { useMutation } from '@apollo/client';
import { useTriggerLoad } from '../../common/LoadingStatus';

const AssignTesterDropdown = ({
    testPlanReportId,
    testPlanRun,
    draftTestPlanRuns,
    possibleTesters,
    onChange,
    label
}) => {
    const dropdownAssignTesterButtonRef = useRef();

    const { triggerLoad } = useTriggerLoad();

    const [removeTester] = useMutation(REMOVE_TESTER_MUTATION);
    const [assignTester] = useMutation(ASSIGN_TESTER_MUTATION);

    const checkIsTesterAssigned = username => {
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
        const isTesterAssigned = checkIsTesterAssigned(username);
        const tester = possibleTesters.find(
            tester => tester.username === username
        );

        if (isTesterAssigned) {
            await triggerLoad(async () => {
                await removeTester({
                    variables: {
                        testReportId: testPlanReportId,
                        testerId: tester.id
                    }
                });
            }, 'Updating Test Plan Assignees');
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

    return (
        <Dropdown aria-label="Assign testers menu">
            <Dropdown.Toggle
                ref={dropdownAssignTesterButtonRef}
                aria-label="Assign testers"
                className="assign-tester"
                variant="secondary"
            >
                {renderLabel()}
            </Dropdown.Toggle>
            <Dropdown.Menu role="menu">
                {possibleTesters?.length ? (
                    possibleTesters.map(({ username }) => {
                        const isTesterAssigned =
                            checkIsTesterAssigned(username);
                        let classname = isTesterAssigned
                            ? 'assigned'
                            : 'not-assigned';
                        return (
                            <Dropdown.Item
                                role="menuitem"
                                variant="secondary"
                                as="button"
                                key={`tpr-${testPlanReportId}-assign-tester-${username}`}
                                onClick={async () => {
                                    await toggleTesterAssign(username);
                                    await onChange();
                                }}
                                aria-checked={isTesterAssigned}
                            >
                                {isTesterAssigned && (
                                    <FontAwesomeIcon icon={faCheck} />
                                )}
                                <span className={classname}>
                                    {`${username}`}
                                </span>
                            </Dropdown.Item>
                        );
                    })
                ) : (
                    <span className="not-assigned">No testers to assign</span>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

AssignTesterDropdown.propTypes = {
    testPlanReportId: PropTypes.string.isRequired,
    possibleTesters: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    testPlanRun: PropTypes.object,
    label: PropTypes.string,
    draftTestPlanRuns: PropTypes.array
};

export default AssignTesterDropdown;
