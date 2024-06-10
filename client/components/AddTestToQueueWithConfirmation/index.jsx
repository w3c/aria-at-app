import React, { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import BasicModal from '../common/BasicModal';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_TEST_QUEUE_MUTATION } from '../TestQueue/queries';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import {
    getBotUsernameFromAtBrowser,
    isSupportedByResponseCollector
} from '../../utils/automation';
import './AddTestToQueueWithConfirmation.css';
import {
    SCHEDULE_COLLECTION_JOB_MUTATION,
    EXISTING_TEST_PLAN_REPORTS
} from './queries';
import { TEST_QUEUE_PAGE_QUERY } from '../TestQueue2/queries';
import { TEST_PLAN_REPORT_STATUS_DIALOG_QUERY } from '../TestPlanReportStatusDialog/queries';
import { ME_QUERY } from '../App/queries';

function AddTestToQueueWithConfirmation({
    testPlanVersion,
    browser,
    at,
    exactAtVersion,
    minimumAtVersion,
    disabled = false,
    buttonText = 'Add to Test Queue',
    triggerUpdate = () => {}
}) {
    if (testPlanVersion?.title.startsWith('Radio Group')) {
        console.log(
            'AddTestToQueueWithConfirmation showConfirmation',
            showConfirmation
        );
    }
    const [showPreserveReportDataMessage, setShowPreserveReportDataMessage] =
        useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [canUseOldResults, setCanUseOldResults] = useState(false);

    const [addTestPlanReport] = useMutation(ADD_TEST_QUEUE_MUTATION, {
        refetchQueries: [
            ME_QUERY,
            EXISTING_TEST_PLAN_REPORTS,
            TEST_QUEUE_PAGE_QUERY,
            TEST_PLAN_REPORT_STATUS_DIALOG_QUERY
        ],
        awaitRefetchQueries: true
    });

    const [scheduleCollection] = useMutation(SCHEDULE_COLLECTION_JOB_MUTATION, {
        refetchQueries: [
            ME_QUERY,
            EXISTING_TEST_PLAN_REPORTS,
            TEST_QUEUE_PAGE_QUERY,
            TEST_PLAN_REPORT_STATUS_DIALOG_QUERY
        ],
        awaitRefetchQueries: true
    });

    const { data: existingTestPlanReportsData } = useQuery(
        EXISTING_TEST_PLAN_REPORTS,
        {
            variables: {
                testPlanVersionId: testPlanVersion?.id,
                directory: testPlanVersion?.testPlan?.directory
            },
            fetchPolicy: 'cache-and-network',
            skip: !testPlanVersion?.id
        }
    );

    const existingTestPlanReports =
        existingTestPlanReportsData?.existingTestPlanVersion?.testPlanReports;

    let latestOldVersion;
    let oldReportToCopyResultsFrom;

    // Check if any results data available from a previous result
    if (existingTestPlanReportsData?.oldTestPlanVersions?.length) {
        latestOldVersion =
            existingTestPlanReportsData?.oldTestPlanVersions?.reduce((a, b) =>
                new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
            );

        if (
            new Date(latestOldVersion?.updatedAt) <
            new Date(testPlanVersion?.updatedAt)
        ) {
            oldReportToCopyResultsFrom = latestOldVersion?.testPlanReports.some(
                ({ at: { id: atId }, browser: { id: browserId } }) =>
                    atId == at?.id && browserId == browser?.id
            );
        }
    }

    const { triggerLoad, loadingMessage } = useTriggerLoad();
    const buttonRef = useRef();

    const hasAutomationSupport = isSupportedByResponseCollector({
        at,
        browser
    });

    const alreadyHasBotInTestPlanReport = useMemo(
        () =>
            existingTestPlanReports?.some(
                tpr =>
                    tpr.markedFinalAt === null &&
                    tpr.draftTestPlanRuns.some(run => run.initiatedByAutomation)
            ),
        [existingTestPlanReports]
    );

    const feedbackModalTitle =
        hasAutomationSupport && testPlanVersion
            ? `Adding ${testPlanVersion.title} Test Plan to the Test Queue`
            : 'Successfully Added Test Plan';

    const feedbackModalContent = hasAutomationSupport ? (
        <>
            Choose how the report for {at?.name} and {browser?.name} will be
            generated. Add it to the queue so it can be assigned to a tester at
            a later time or start running automated response collection with{' '}
            {getBotUsernameFromAtBrowser(at, browser)}.
        </>
    ) : (
        <>
            Successfully added <b>{testPlanVersion?.title}</b> for{' '}
            <b>
                {at?.name} and {browser?.name}
            </b>{' '}
            to the Test Queue.
        </>
    );

    const closeWithUpdate = async () => {
        setShowConfirmation(false);
        await triggerUpdate();
        await new Promise(resolve => setTimeout(resolve, 0));
        if (buttonRef?.current) {
            buttonRef.current.focus();
        }
    };

    const renderConfirmation = () => {
        const actions = [];
        if (hasAutomationSupport) {
            actions.push({
                label: 'Add and run later',
                onClick: async () => {
                    await addTestToQueue(
                        canUseOldResults
                            ? {
                                  copyResultsFromTestPlanVersionId:
                                      latestOldVersion.id
                              }
                            : {}
                    );
                    // await closeWithUpdate();
                }
            });

            if (!alreadyHasBotInTestPlanReport) {
                actions.push({
                    label: 'Add and run with bot',
                    onClick: async () => {
                        const testPlanReport = await addTestToQueue(
                            canUseOldResults
                                ? {
                                      copyResultsFromTestPlanVersionId:
                                          latestOldVersion.id
                                  }
                                : {}
                        );
                        await scheduleCollectionJob(testPlanReport);
                        await closeWithUpdate();
                    }
                });
            }
        }
        return (
            <BasicModal
                dialogClassName="add-test-to-queue-confirmation"
                show={showConfirmation}
                title={feedbackModalTitle}
                content={feedbackModalContent}
                closeLabel={hasAutomationSupport ? 'Cancel' : 'Ok'}
                staticBackdrop={true}
                actions={actions}
                useOnHide
                handleClose={async () => {
                    if (hasAutomationSupport) {
                        setShowConfirmation(false);
                    } else {
                        await closeWithUpdate();
                    }
                }}
            />
        );
    };

    const renderPreserveReportDataDialog = () => {
        return (
            <BasicModal
                show={showPreserveReportDataMessage}
                title="Older Results Data Found"
                content={
                    'Older results with the same AT, browser and test plan ' +
                    'were found for the report being created. Would you like ' +
                    'to copy the older results into the report or create a ' +
                    'completely new report?'
                }
                closeLabel="Cancel"
                staticBackdrop={true}
                actions={[
                    {
                        label: 'Create empty report',
                        onClick: async () => {
                            setShowPreserveReportDataMessage(false);
                            if (hasAutomationSupport) {
                                setShowConfirmation(true);
                            } else {
                                await addTestToQueue();
                            }
                        }
                    },
                    {
                        label: 'Copy older results',
                        onClick: async () => {
                            setShowPreserveReportDataMessage(false);
                            setCanUseOldResults(true);

                            if (hasAutomationSupport) {
                                setShowConfirmation(true);
                            } else {
                                await addTestToQueue({
                                    copyResultsFromTestPlanVersionId:
                                        latestOldVersion.id
                                });
                            }
                        }
                    }
                ]}
                useOnHide
                handleClose={async () => {
                    setShowPreserveReportDataMessage(false);
                }}
            />
        );
    };

    const addTestToQueue = async ({
        copyResultsFromTestPlanVersionId
    } = {}) => {
        let tpr;
        await triggerLoad(async () => {
            const res = await addTestPlanReport({
                variables: {
                    testPlanVersionId: testPlanVersion.id,
                    atId: at.id,
                    minimumAtVersionId: minimumAtVersion?.id,
                    exactAtVersionId: exactAtVersion?.id,
                    browserId: browser.id,
                    copyResultsFromTestPlanVersionId
                }
            });
            const testPlanReport =
                res?.data?.createTestPlanReport?.testPlanReport ?? null;
            tpr = testPlanReport;
        }, 'Adding Test Plan to Test Queue');
        setShowConfirmation(true);
        return tpr;
    };

    const scheduleCollectionJob = async testPlanReport => {
        await triggerLoad(async () => {
            await scheduleCollection({
                variables: {
                    testPlanReportId: testPlanReport.id
                }
            });
        }, 'Scheduling Collection Job');
        setShowConfirmation(true);
    };

    return (
        <LoadingStatus message={loadingMessage}>
            <Button
                ref={buttonRef}
                disabled={disabled}
                variant="secondary"
                onClick={async () => {
                    if (oldReportToCopyResultsFrom) {
                        setShowPreserveReportDataMessage(true);
                    } else {
                        if (hasAutomationSupport) {
                            setShowConfirmation(true);
                        } else {
                            await addTestToQueue();
                        }
                    }
                }}
                className="w-auto"
                data-testid="add-button"
            >
                {buttonText}
            </Button>
            {renderPreserveReportDataDialog()}
            {renderConfirmation()}
        </LoadingStatus>
    );
}

AddTestToQueueWithConfirmation.propTypes = {
    testPlanVersion: PropTypes.object,
    browser: PropTypes.shape({
        id: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }),
    at: PropTypes.shape({
        id: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }),
    exactAtVersion: PropTypes.object,
    minimumAtVersion: PropTypes.object,
    buttonRef: PropTypes.object,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    disabled: PropTypes.bool,
    buttonText: PropTypes.string,
    triggerUpdate: PropTypes.func
};

export default AddTestToQueueWithConfirmation;
