import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { CANCEL_COLLECTION_JOB } from '../queries';
import { LoadingStatus, useTriggerLoad } from '../../common/LoadingStatus';

const StopRunningCollectionButton = ({ collectionJob, onClick = () => {} }) => {
  if (!collectionJob) {
    return null;
  }

  const { triggerLoad, loadingMessage } = useTriggerLoad();

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
    <LoadingStatus message={loadingMessage}>
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
    </LoadingStatus>
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
