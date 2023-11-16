import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { RETRY_CANCELLED_COLLECTIONS } from '../queries';

const RetryCancelledCollectionsButton = ({
    collectionJob,
    onClick = () => {}
}) => {
    if (!collectionJob) {
        return null;
    }

    const [retryCancelledCollections] = useMutation(
        RETRY_CANCELLED_COLLECTIONS,
        {
            variables: {
                collectionJobId: collectionJob.id
            }
        }
    );

    const handleClick = async () => {
        await retryCancelledCollections();
        await onClick();
    };

    return (
        <Button
            variant="secondary"
            onClick={handleClick}
            disabled={collectionJob.status !== 'CANCELLED'}
        >
            Retry Cancelled Collections
        </Button>
    );
};

RetryCancelledCollectionsButton.propTypes = {
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

export default RetryCancelledCollectionsButton;
