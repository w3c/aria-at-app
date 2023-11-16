import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import BasicModal from '../common/BasicModal';
import { useMutation } from '@apollo/client';
import { ADD_TEST_QUEUE_MUTATION } from '../TestQueue/queries';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import {
    getBotUsernameFromAtBrowser,
    isSupportedByResponseCollector
} from '../../utils/automation';
import './AddTestToQueueWithConfirmation.css';
import { SCHEDULE_COLLECTION_JOB_MUTATION } from './queries';

function AddTestToQueueWithConfirmation({
    testPlanVersion,
    browser,
    at,
    disabled = false,
    buttonText = 'Add to Test Queue',
    triggerUpdate = () => {}
}) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [addTestPlanReport] = useMutation(ADD_TEST_QUEUE_MUTATION);
    const [scheduleCollection] = useMutation(SCHEDULE_COLLECTION_JOB_MUTATION);
    const { triggerLoad, loadingMessage } = useTriggerLoad();
    const buttonRef = useRef();

    const hasAutomationSupport = isSupportedByResponseCollector({
        at,
        browser
    });

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
            actions.push(
                {
                    label: 'Add and run later',
                    onClick: async () => {
                        await addTestToQueue();
                        await closeWithUpdate();
                    }
                },
                {
                    label: 'Add and run with bot',
                    onClick: async () => {
                        const testPlanReport = await addTestToQueue();
                        await scheduleCollectionJob(testPlanReport);
                        await closeWithUpdate();
                    }
                }
            );
        }
        return (
            <BasicModal
                dialogClassName={'add-test-to-queue-confirmation'}
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

    const addTestToQueue = async () => {
        let tpr;
        await triggerLoad(async () => {
            const res = await addTestPlanReport({
                variables: {
                    testPlanVersionId: testPlanVersion.id,
                    atId: at.id,
                    browserId: browser.id
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
                    if (hasAutomationSupport) {
                        setShowConfirmation(true);
                    } else {
                        await addTestToQueue();
                    }
                }}
                className="w-auto"
                data-testid="add-button"
            >
                {buttonText}
            </Button>
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
