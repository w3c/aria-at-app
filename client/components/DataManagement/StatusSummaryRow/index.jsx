import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useMutation } from '@apollo/client';
import { Dropdown } from 'react-bootstrap';
import nextId from 'react-id-generator';
import { BULK_UPDATE_TEST_PLAN_REPORT_STATUS_MUTATION } from '../queries';
import { LoadingStatus, useTriggerLoad } from '../../common/LoadingStatus';
import BasicThemedModal from '../../common/BasicThemedModal';

const PhaseText = styled.span`
    font-size: 14px;
    margin-left: 8px;
    padding: 4px 8px;
    border-radius: 14px;
    overflow: hidden;
    white-space: nowrap;
    color: white;

    &.draft {
        background: #838f97;
    }

    &.candidate {
        background: #f87f1b;
    }

    &.recommended {
        background: #b253f8;
    }
`;

const PhaseDot = styled.span`
    display: inline-block;
    height: 10px;
    width: 10px;
    padding: 0;
    margin-right: 8px;
    border-radius: 50%;

    &.draft {
        background: #838f97;
    }

    &.candidate {
        background: #f87f1b;
    }

    &.recommended {
        background: #b253f8;
    }
`;

const NoPhaseText = styled.span`
    margin-left: 12px;
    margin-right: 12px;
`;

const StatusSummaryRow = ({ reportResult, testPlanVersion }) => {
    const [bulkUpdateTestPlanReportStatusMutation] = useMutation(
        BULK_UPDATE_TEST_PLAN_REPORT_STATUS_MUTATION
    );

    const dropdownUpdateReportStatusButtonRef = useRef();
    const { triggerLoad, loadingMessage } = useTriggerLoad();

    const [testPlanReports, setTestPlanReports] = useState(
        Object.values(reportResult).filter(i => i !== null)
    );
    const [showThemedModal, setShowThemedModal] = useState(false);
    const [themedModalType, setThemedModalType] = useState('warning');
    const [themedModalTitle, setThemedModalTitle] = useState('');
    const [themedModalContent, setThemedModalContent] = useState(<></>);

    const bulkUpdateReportStatus = async (testPlanReportIds, status) => {
        try {
            await triggerLoad(async () => {
                const result = await bulkUpdateTestPlanReportStatusMutation({
                    variables: {
                        testReportIds: testPlanReportIds,
                        status
                    }
                });
                setTestPlanReports(
                    result.data.testPlanReport.bulkUpdateStatus.map(
                        i => i.testPlanReport
                    )
                );
            }, 'Updating Test Plan Status');
        } catch (e) {
            showThemedMessage(
                'Error Updating Test Plan Status',
                <>{e.message}</>,
                'warning'
            );
        }
    };

    const showThemedMessage = (title, content, theme) => {
        setThemedModalTitle(title);
        setThemedModalContent(content);
        setThemedModalType(theme);
        setShowThemedModal(true);
    };

    const onThemedModalClose = () => {
        setShowThemedModal(false);
        dropdownUpdateReportStatusButtonRef.current.focus();
    };

    let phase = 'Draft';
    if (testPlanReports.every(i => i.status === 'RECOMMENDED'))
        phase = 'Recommended';
    else if (testPlanReports.every(i => i.status === 'CANDIDATE'))
        phase = 'Candidate';

    return (
        <LoadingStatus message={loadingMessage}>
            <tr>
                <th>
                    {testPlanVersion.title}
                    {Object.entries(reportResult).length > 0 && (
                        <PhaseText className={phase.toLowerCase()}>
                            {phase}
                        </PhaseText>
                    )}
                </th>
                <td>
                    {(Object.entries(reportResult).length <= 0 && (
                        <NoPhaseText>Not tested</NoPhaseText>
                    )) || (
                        <Dropdown className="change-phase">
                            <Dropdown.Toggle
                                id={nextId()}
                                ref={dropdownUpdateReportStatusButtonRef}
                                variant="secondary"
                                aria-label={`Change test plan phase for ${testPlanVersion.title}`}
                            >
                                <PhaseDot className={phase.toLowerCase()} />
                                {phase}
                            </Dropdown.Toggle>
                            <Dropdown.Menu role="menu">
                                <Dropdown.Item
                                    role="menuitem"
                                    disabled={phase === 'Draft'}
                                    onClick={async () => {
                                        await bulkUpdateReportStatus(
                                            testPlanReports.map(i => i.id),
                                            'DRAFT'
                                        );
                                    }}
                                >
                                    <PhaseDot className="draft" />
                                    Draft
                                </Dropdown.Item>
                                <Dropdown.Item
                                    role="menuitem"
                                    disabled={phase === 'Candidate'}
                                    onClick={async () => {
                                        await bulkUpdateReportStatus(
                                            testPlanReports.map(i => i.id),
                                            'CANDIDATE'
                                        );
                                    }}
                                >
                                    <PhaseDot className="candidate" />
                                    Candidate
                                </Dropdown.Item>
                                <Dropdown.Item
                                    role="menuitem"
                                    disabled={phase === 'Recommended'}
                                    onClick={async () => {
                                        await bulkUpdateReportStatus(
                                            testPlanReports.map(i => i.id),
                                            'RECOMMENDED'
                                        );
                                    }}
                                >
                                    <PhaseDot className="recommended" />
                                    Recommended
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    )}
                </td>
            </tr>

            {showThemedModal && (
                <BasicThemedModal
                    show={showThemedModal}
                    theme={themedModalType}
                    title={themedModalTitle}
                    dialogClassName="modal-50w"
                    content={themedModalContent}
                    actionButtons={[
                        {
                            text: 'Ok',
                            action: onThemedModalClose
                        }
                    ]}
                    handleClose={onThemedModalClose}
                    showCloseAction={false}
                />
            )}
        </LoadingStatus>
    );
};

StatusSummaryRow.propTypes = {
    reportResult: PropTypes.object,
    testPlanVersion: PropTypes.object
};

export default StatusSummaryRow;
