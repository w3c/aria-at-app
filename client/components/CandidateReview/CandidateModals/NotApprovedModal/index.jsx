import React from 'react';
import BasicModal from '../../../common/BasicModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import '../common.css';

const NotApprovedModal = ({ handleAction = () => {}, githubUrl = '#' }) => {
  return (
    <BasicModal
      show={true}
      centered={true}
      closeButton={false}
      content={
        <>
          <p className="review-confirmation-content">Thank you for reviewing</p>
          <p className="review-confirmation-share">
            If you haven’t opened any issues yet, please{' '}
            <a href={githubUrl} target="_blank" rel="noreferrer">
              open an issue describing why this is not approved.
            </a>
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
            icon={faExclamationTriangle}
            className="review-confirmation-check"
            color="orange"
          />
          <h1>Thank you!</h1>
        </div>
      }
    />
  );
};

NotApprovedModal.propTypes = {
  handleAction: PropTypes.func,
  githubUrl: PropTypes.string
};

export default NotApprovedModal;
