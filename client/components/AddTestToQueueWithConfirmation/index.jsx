import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import BasicModal from '../common/BasicModal';
import { useMutation } from '@apollo/client';
import { ADD_TEST_QUEUE_MUTATION } from '../TestQueue/queries';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';

function AddTestToQueueWithConfirmation({
    testPlanVersion,
    browser,
    at,
    buttonText = 'Add to Test Queue'
}) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [addTestPlanReport] = useMutation(ADD_TEST_QUEUE_MUTATION);
    const { triggerLoad, loadingMessage } = useTriggerLoad();

    const feedbackModalTitle = 'Successfully Added Test Plan';

    const feedbackModalContent = (
        <>
            Successfully added <b>{testPlanVersion.title}</b> for{' '}
            <b>
                {at.name} and {browser.name}
            </b>{' '}
            to the Test Queue.
        </>
    );

    const addTestToQueue = async () => {
        await triggerLoad(async () => {
            await addTestPlanReport({
                variables: {
                    testPlanVersionId: testPlanVersion.id,
                    atId: at.id,
                    browserId: browser.id
                }
            });
        }, 'Adding Test Plan to Test Queue');
        setShowConfirmation(true);
    };

    return (
        <>
            <LoadingStatus message={loadingMessage}></LoadingStatus>
            <Button
                variant="secondary"
                disabled={false}
                onClick={addTestToQueue}
                className="w-auto"
            >
                {buttonText}
            </Button>
            <BasicModal
                show={showConfirmation}
                closeButton={false}
                title={feedbackModalTitle}
                content={feedbackModalContent}
                closeLabel="Ok"
                handleClose={() => {
                    setShowConfirmation(false);
                }}
            />
        </>
    );
}

AddTestToQueueWithConfirmation.propTypes = {
    testPlanVersion: PropTypes.object.isRequired,
    browser: PropTypes.object.isRequired,
    at: PropTypes.object.isRequired,
    buttonText: PropTypes.string
};

export default AddTestToQueueWithConfirmation;
