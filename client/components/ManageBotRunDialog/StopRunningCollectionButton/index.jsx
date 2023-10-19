import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { CANCEL_COLLECTION_JOB } from '../queries';
import { useTriggerLoad } from '../../common/LoadingStatus';

const StopRunningCollectionButton = ({ collectionJob, onClick = () => {} }) => {
    if (!collectionJob) {
        return null;
    }

    const { triggerLoad } = useTriggerLoad();

    const [cancelCollectionJob] = useMutation(CANCEL_COLLECTION_JOB, {
        variables: {
            collectionJobId: collectionJob.id
        }
    });

    const handleClick = async () => {
        await triggerLoad(async () => {
            await cancelCollectionJob();
        }, 'Cancelling Collection Job');
        await onClick();
    };

    return (
        <Button
            variant="secondary"
            onClick={handleClick}
            disabled={
                !(
                    collectionJob.status === 'RUNNING' ||
                    collectionJob.status === 'QUEUED'
                )
            }
        >
            Stop Running
        </Button>
    );
};

StopRunningCollectionButton.propTypes = {
    collectionJob: PropTypes.shape({
        id: PropTypes.string,
        status: PropTypes.oneOf([
            'QUEUED',
            'RUNNING',
            'CANCELLED',
            'COMPLETED',
            'ERROR'
        ])
    }),
    onClick: PropTypes.func
};

export default StopRunningCollectionButton;
