import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { RETRY_CANCELED_COLLECTIONS } from '../queries';
import { CollectionJobPropType } from '../../common/proptypes';

const RetryCanceledCollectionsButton = ({
  collectionJob,
  onClick = () => {}
}) => {
  const [retryCanceledCollections] = useMutation(RETRY_CANCELED_COLLECTIONS, {
    variables: { collectionJobId: collectionJob.id },
    skip: !collectionJob
  });

  if (!collectionJob) {
    return null;
  }

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
  collectionJob: CollectionJobPropType,
  onClick: PropTypes.func
};

export default RetryCanceledCollectionsButton;
