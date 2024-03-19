import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { RETRY_CANCELED_COLLECTIONS } from '../queries';

const RetryCanceledCollectionsButton = ({
  collectionJob,
  onClick = () => {}
}) => {
  if (!collectionJob) {
    return null;
  }

  const [retryCanceledCollections] = useMutation(RETRY_CANCELED_COLLECTIONS, {
    variables: { collectionJobId: collectionJob.id }
  });

  const handleClick = async () => {
    await retryCanceledCollections();
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

RetryCanceledCollectionsButton.propTypes = {
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

export default RetryCanceledCollectionsButton;
