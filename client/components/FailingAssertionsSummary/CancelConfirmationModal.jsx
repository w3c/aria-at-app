import React from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../common/BasicModal';

const CancelConfirmationModal = ({ show, onConfirm, onCancel }) => {
  return (
    <BasicModal
      show={show}
      centered
      size="sm"
      title="Unsaved Changes"
      content={
        <div>
          <p>You have unsaved changes. Are you sure you want to cancel?</p>
        </div>
      }
      handleClose={onCancel}
      useOnHide
      cancelButton={false}
      actions={[
        {
          label: 'Keep Editing',
          onClick: onCancel,
          className: 'btn-secondary'
        },
        {
          label: 'Discard Changes',
          onClick: onConfirm,
          className: 'btn-danger'
        }
      ]}
    />
  );
};

CancelConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default CancelConfirmationModal;
