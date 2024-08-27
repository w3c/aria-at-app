import React from 'react';
import BasicModal from '../BasicModal';
import PhasePill from '../PhasePill';
import PropTypes from 'prop-types';
import { AtPropType, BrowserPropType } from '../proptypes';

const DeleteRequiredReportModal = ({
  at,
  browser,
  phase,
  handleClose,
  handleDeleteReqReport
}) => {
  const handleDelete = () => {
    handleDeleteReqReport({ atId: at.id, browserId: browser.id, phase });
    handleClose();
  };

  return (
    <BasicModal
      show={true}
      closeButton={false}
      cancelButton={true}
      headerSep={true}
      title={
        <p>
          Delete {`${at.name} and ${browser.name} pair for `}
          <PhasePill fullWidth={false} forHeader={true}>
            {phase}
          </PhasePill>
          {' required reports'}
        </p>
      }
      dialogClassName="modal-50w"
      actions={[
        {
          label: 'Confirm Delete',
          onClick: handleDelete
        }
      ]}
      handleClose={handleClose}
      staticBackdrop={true}
    />
  );
};

DeleteRequiredReportModal.propTypes = {
  at: AtPropType.isRequired,
  browser: BrowserPropType.isRequired,
  phase: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDeleteReqReport: PropTypes.func.isRequired
};

export default DeleteRequiredReportModal;
