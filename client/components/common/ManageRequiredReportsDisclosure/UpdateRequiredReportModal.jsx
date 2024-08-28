import React, { useMemo, useState } from 'react';
import PhasePill from '../PhasePill';
import styled from '@emotion/styled';
import BasicModal from '../BasicModal';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { AtPropType } from '../proptypes';

const ModalInnerSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
`;

const UpdateRequiredReportModal = ({
  atId,
  browserId,
  ats,
  phase,
  handleClose,
  handleUpdate
}) => {
  const [atSelection, setAtSelection] = useState(atId);
  const [browserSelection, setBrowserSelection] = useState(browserId);

  const handleAtChange = e => {
    const value = e.target.value;
    setAtSelection(value);
  };

  const handleBrowserChange = e => {
    const value = e.target.value;
    setBrowserSelection(value);
  };

  const filteredBrowsers = useMemo(
    () => ats.find(at => at.id === atSelection)?.browsers || [],
    [ats, atSelection]
  );

  return (
    <BasicModal
      show={true}
      closeButton={false}
      cancelButton={true}
      headerSep={true}
      title={
        <p>
          Edit the following AT/Browser pair for{' '}
          <PhasePill fullWidth={false} forHeader={true}>
            {phase}
          </PhasePill>{' '}
          required reports
        </p>
      }
      dialogClassName="modal-50w"
      content={
        <ModalInnerSectionContainer>
          {
            <Row>
              <Form.Group className="form-group">
                <Form.Label>Assistive Technology</Form.Label>
                <Form.Select
                  value={atSelection}
                  onChange={handleAtChange}
                  required
                >
                  {ats.map(item => {
                    return (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Browser</Form.Label>
                <Form.Select
                  value={browserSelection}
                  onChange={handleBrowserChange}
                  data-testid="required-report-browser-select"
                  required
                >
                  <option value={''} disabled>
                    Select a Browser
                  </option>
                  {filteredBrowsers.map(item => (
                    <option key={`${item.name}-${item.id}`} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>
          }
        </ModalInnerSectionContainer>
      }
      actions={[
        {
          label: 'Save Changes',
          onClick: () => {
            // If the user has changed the AT or Browser, update the required report
            if (atSelection !== atId || browserSelection !== browserId) {
              handleUpdate({
                atId,
                browserId,
                phase,
                updateAtId: atSelection,
                updateBrowserId: browserSelection
              });
            }
            handleClose();
          }
        }
      ]}
      handleClose={handleClose}
      staticBackdrop={true}
    />
  );
};

UpdateRequiredReportModal.propTypes = {
  atId: PropTypes.string.isRequired,
  browserId: PropTypes.string.isRequired,
  ats: PropTypes.arrayOf(AtPropType).isRequired,
  phase: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired
};

export default UpdateRequiredReportModal;
