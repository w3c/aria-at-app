import React from 'react';
import BasicModal from '../../../common/BasicModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import '../common.css';

const ApprovedModal = ({ handleAction = () => {}, githubUrl = '#' }) => {
  return (
    <BasicModal
      show={true}
      centered={true}
      closeButton={false}
      content={
        <>
          <p className="review-confirmation-content">
            Your Review has been submitted!
          </p>
          <p className="review-confirmation-share">
            Do you have anything else to share?
          </p>
          <p className="review-confirmation-issue">
            <a href={githubUrl} target="_blank" rel="noreferrer">
              Open a GitHub issue
            </a>{' '}
            to leave more feedback{' '}
          </p>
        </>
      }
      dialogClassName="review-confirmation"
      actions={[
        {
          label: 'Close',
          onClick: handleAction
        }
      ]}
      title={
        <div className="review-confirmation-title">
          <FontAwesomeIcon
            icon={faCheck}
            className="review-confirmation-check"
            color="green"
          />
          <h1>Thank you!</h1>
        </div>
      }
    />
  );
};

ApprovedModal.propTypes = {
  handleAction: PropTypes.func,
  githubUrl: PropTypes.string
};

export default ApprovedModal;
