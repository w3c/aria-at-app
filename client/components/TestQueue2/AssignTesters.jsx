import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Button, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import useConfirmationModal from '../../hooks/useConfirmationModal';
import BasicThemedModal from '../common/BasicThemedModal';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import { useAriaLiveRegion } from '../providers/AriaLiveRegionProvider';
import { evaluateAuth } from '../../utils/evaluateAuth';
import { useApolloClient } from '@apollo/client';
import {
    ASSIGN_TESTER_MUTATION,
    DELETE_TEST_PLAN_RUN,
    TEST_QUEUE_PAGE_QUERY
} from './queries';
import { TEST_PLAN_REPORT_STATUS_DIALOG_QUERY } from '../TestPlanReportStatusDialog/queries';

const AssignTestersContainer = styled.div`
    display: flex;

    [role='menu'] {
        width: 250px;
        max-height: 200px;
        overflow-y: scroll;
    }

    [role='menuitem']:active {
        background-color: #0b60ab;
    }
`;

const AssignTestersDropdownButton = styled(Dropdown.Toggle)`
    width: min-content !important;
    margin-right: 0.5rem;
`;

const AssignedTestersUl = styled.ul`
    font-weight: normal;
    padding-top: 0.5rem;
    text-align: center;

    li:not(:last-of-type) {
        padding-bottom: 0.25rem;
    }
    a,
    span {
        font-weight: normal;
        padding-right: 0.5rem;
    }
    em {
        color: rgb(var(--bs-secondary-rgb));
        font-style: normal;
        display: inline-block;
    }
`;

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
                    `#assign-testers-${testPlanReport.id} [role="menuitem"]`
                )
                .focus();
        }, 1);
    };

    const onKeyDown = event => {
        const { key } = event;
        if (key.match(/[a-z]/)) {
            const container = event.target.closest('[role=menu]');
            const matchingMenuItem = Array.from(container.children).find(
                menuItem => {
                    return menuItem.innerText
                        .trim()
                        .toLowerCase()
                        .startsWith(key);
                }
            );

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
            const testerFormatted = isSelfAssigned
                ? 'your'
                : `${tester.username}'s`;

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
        const isAssigned = testPlanReport.draftTestPlanRuns.some(
            testPlanRun => testPlanRun.tester.username === tester.username
        );

        let icon;
        if (isAssigned) {
            icon = faCheck;
        } else if (tester.isBot) {
            icon = faRobot;
        }

        return (
            <Dropdown.Item
                key={tester.id}
                eventKey={tester.id}
                role="menuitem"
                variant="secondary"
                as="button"
                onClick={async () => {}}
            >
                <span className="sr-only">{`${tester.username} ${
                    isAssigned ? 'assigned' : 'unassigned'
                }`}</span>
                <span aria-hidden="true">
                    {icon && <FontAwesomeIcon icon={icon} />}
                    {`${tester.username}`}
                </span>
            </Dropdown.Item>
        );
    };

    return (
        <LoadingStatus message={loadingMessage}>
            <AssignTestersContainer>
                {isAdmin && (
                    <Dropdown
                        id={`assign-testers-${testPlanReport.id}`}
                        onToggle={onToggle}
                        onSelect={onSelect}
                        onKeyDown={onKeyDown}
                    >
                        <AssignTestersDropdownButton
                            variant="secondary"
                            ref={dropdownButtonRef}
                        >
                            <span className="sr-only">Assign Testers</span>
                            <FontAwesomeIcon icon={faUser} />
                        </AssignTestersDropdownButton>
                        <Dropdown.Menu role="menu">
                            {testers.map(tester =>
                                renderDropdownItem({ tester })
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                )}
                {isTester && (
                    <Button
                        variant="secondary"
                        ref={assignSelfButtonRef}
                        onClick={onToggleSelf}
                    >
                        {isSelfAssigned
                            ? 'Unassign Yourself'
                            : 'Assign Yourself'}
                    </Button>
                )}
            </AssignTestersContainer>
            <AssignedTestersUl>
                {testPlanReport.draftTestPlanRuns.map(testPlanRun => {
                    const tester = testPlanRun.tester;
                    const { username } = tester;

                    let userLink;
                    if (tester.isBot) {
                        userLink = (
                            <span>
                                <FontAwesomeIcon icon={faRobot} />
                                {username}
                            </span>
                        );
                    } else {
                        userLink = (
                            <a href={`https://github.com/${username}`}>
                                {username}
                            </a>
                        );
                    }

                    return (
                        <li key={testPlanRun.id}>
                            {userLink}
                            <em>
                                {`${testPlanRun.testResultsLength} of ` +
                                    `${testPlanReport.runnableTestsLength} tests complete`}
                            </em>
                        </li>
                    );
                })}
            </AssignedTestersUl>
        </LoadingStatus>
    );
};

AssignTesters.propTypes = {
    me: PropTypes.shape({
        id: PropTypes.string.isRequired
    }),
    testers: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired
        })
    ).isRequired,
    testPlanReport: PropTypes.shape({
        id: PropTypes.string.isRequired,
        runnableTestsLength: PropTypes.number.isRequired,
        draftTestPlanRuns: PropTypes.arrayOf(
            PropTypes.shape({
                tester: PropTypes.shape({ id: PropTypes.string.isRequired })
                    .isRequired
            })
        ).isRequired,
        at: PropTypes.shape({
            name: PropTypes.string.isRequired
        }).isRequired,
        browser: PropTypes.shape({
            name: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default AssignTesters;
