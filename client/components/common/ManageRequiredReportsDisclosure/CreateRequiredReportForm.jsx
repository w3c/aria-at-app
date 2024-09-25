import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import styled from '@emotion/styled';
import { AtPropType } from '../proptypes';

const StyledSelect = styled(Form.Select)`
  appearance: none;
  background-image: url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e');
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  padding: 0.375rem 2.25rem 0.375rem 0.75rem;

  ${props =>
    props.value &&
    `
    background-color: ${props.value === 'Candidate' ? '#ff6c00' : '#8441de'};
    color: white;
    border-radius: 1.5rem;
    padding-left: 1rem;
  `}
`;

const FormGroup = ({ label, children }) => (
  <Form.Group className="form-group">
    <Form.Label className="disclosure-form-label">{label}</Form.Label>
    {children}
  </Form.Group>
);

export const CreateRequiredReportForm = ({ ats, handleCreate }) => {
  const [formState, setFormState] = useState({
    phase: '',
    at: '',
    browser: ''
  });

  const handleInputChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await handleCreate({
      atId: formState.at,
      browserId: formState.browser,
      phase: formState.phase.toUpperCase()
    });
    setFormState({ phase: '', at: '', browser: '' });
  };

  return (
    <div className="disclosure-row-controls">
      <FormGroup label="Phase">
        <StyledSelect
          value={formState.phase}
          onChange={e => handleInputChange('phase', e.target.value)}
          required
        >
          <option value="" disabled>
            Select a Phase
          </option>
          {['Candidate', 'Recommended'].map(phase => (
            <option key={phase} value={phase}>
              {phase}
            </option>
          ))}
        </StyledSelect>
      </FormGroup>
      <FormGroup label="Assistive Technology">
        <Form.Select
          value={formState.at}
          onChange={e => handleInputChange('at', e.target.value)}
          required
        >
          <option value="" disabled>
            Select an Assistive Technology
          </option>
          {ats.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Form.Select>
      </FormGroup>
      <FormGroup label="Browser">
        <Form.Select
          value={formState.browser}
          onChange={e => handleInputChange('browser', e.target.value)}
          required
        >
          <option value="" disabled>
            Select a Browser
          </option>
          {ats
            .find(at => at.id === formState.at)
            ?.browsers.map(item => (
              <option key={`${item.name}-${item.id}`} value={item.id}>
                {item.name}
              </option>
            ))}
        </Form.Select>
      </FormGroup>
      <FormGroup>
        <Button
          disabled={!formState.phase || !formState.at || !formState.browser}
          onClick={handleSubmit}
        >
          Add Required Reports
        </Button>
      </FormGroup>
    </div>
  );
};

FormGroup.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired
};

CreateRequiredReportForm.propTypes = {
  ats: PropTypes.arrayOf(AtPropType).isRequired,
  handleCreate: PropTypes.func.isRequired
};

CreateRequiredReportForm.propTypes = {};
