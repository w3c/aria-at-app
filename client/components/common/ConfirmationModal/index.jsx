import React from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../BasicModal';

/**
 * Generic confirmation modal component
 */
const ConfirmationModal = ({
  show,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmButtonClass = 'btn-danger',
  cancelButtonClass = 'btn-secondary'
}) => {
  return (
    <BasicModal
      show={show}
      centered
      size="sm"
      title={title}
      content={
        <div>
          <p>{message}</p>
        </div>
      }
      handleClose={onCancel}
      useOnHide
      cancelButton={false}
      actions={[
        {
          label: cancelLabel,
          onClick: onCancel,
          className: cancelButtonClass
        },
        {
          label: confirmLabel,
          onClick: onConfirm,
          className: confirmButtonClass
        }
      ]}
    />
  );
};

ConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string.isRequired,
  cancelLabel: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmButtonClass: PropTypes.string,
  cancelButtonClass: PropTypes.string
};

export default ConfirmationModal;

