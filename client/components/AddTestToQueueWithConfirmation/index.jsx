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

function AddTestToQueueWithConfirmation({
    testPlanVersion,
    browser,
    at,
    disabled = false,
    buttonText = 'Add to Test Queue',
    triggerUpdate = () => {}
}) {
    const [showPreserveReportDataMessage, setShowPreserveReportDataMessage] =
        useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [canUseOldResults, setCanUseOldResults] = useState(false);
    const [addTestPlanReport] = useMutation(ADD_TEST_QUEUE_MUTATION);
    const [scheduleCollection] = useMutation(SCHEDULE_COLLECTION_JOB_MUTATION);
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

    const conflictingReportExists = existingTestPlanReports?.some(report => {
        return (
            report.at.id === at?.id &&
            report.browser.id === browser?.id &&
            report.isFinal
        );
    });

    let latestOldVersion;
    let oldReportToCopyResultsFrom;

    // Prioritize a conflicting report for the current version, otherwise
    // check if any results data available from a previous result
    if (
        !conflictingReportExists &&
        existingTestPlanReportsData?.oldTestPlanVersions?.length
    ) {
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
                                  copyResultsFromTestPlanReportId:
                                      latestOldVersion.id
                              }
                            : {}
                    );
                    await closeWithUpdate();
                }
            });

            if (!alreadyHasBotInTestPlanReport) {
                actions.push({
                    label: 'Add and run with bot',
                    onClick: async () => {
                        const testPlanReport = await addTestToQueue(
                            canUseOldResults
                                ? {
                                      copyResultsFromTestPlanReportId:
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
        let title;
        let content;
        let actions = [];

        if (oldReportToCopyResultsFrom) {
            title = 'Older Results Data Found';
            content =
                'Older results with the same AT, browser and test plan ' +
                'were found for the report being created. Would you like ' +
                'to copy the older results into the report or create a ' +
                'completely new report?';
            actions = [
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
                                copyResultsFromTestPlanReportId:
                                    latestOldVersion.id
                            });
                        }
                    }
                }
            ];
        } else {
            title = 'Conflicting Report Found';
            content =
                'The report could not be created because an existing ' +
                'report was found on the reports page with the same AT, ' +
                'browser and test plan version. Would you like to return ' +
                'the existing report back to the test queue?';
            actions = [
                {
                    label: 'Proceed',
                    onClick: async () => {
                        setShowPreserveReportDataMessage(false);
                        if (hasAutomationSupport) {
                            setShowConfirmation(true);
                        } else {
                            await addTestToQueue();
                        }
                    }
                }
            ];
        }

        return (
            <BasicModal
                show={showPreserveReportDataMessage}
                title={title}
                content={content}
                closeLabel="Cancel"
                staticBackdrop={true}
                actions={actions}
                useOnHide
                handleClose={async () => {
                    setShowPreserveReportDataMessage(false);
                }}
            />
        );
    };

    const addTestToQueue = async ({ copyResultsFromTestPlanReportId } = {}) => {
        let tpr;
        await triggerLoad(async () => {
            const res = await addTestPlanReport({
                variables: {
                    testPlanVersionId: testPlanVersion.id,
                    atId: at.id,
                    browserId: browser.id,
                    copyResultsFromTestPlanReportId
                }
            });
            const testPlanReport =
                res?.data?.findOrCreateTestPlanReport?.populatedData
                    ?.testPlanReport ?? null;
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
                    if (conflictingReportExists || oldReportToCopyResultsFrom) {
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
    browser: PropTypes.object,
    at: PropTypes.object,
    buttonRef: PropTypes.object,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    disabled: PropTypes.bool,
    buttonText: PropTypes.string,
    triggerUpdate: PropTypes.func
};

export default AddTestToQueueWithConfirmation;
