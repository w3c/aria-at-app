import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Form } from 'react-bootstrap';
import styled from '@emotion/styled';
import { AtPropType } from '../proptypes';

const CustomToggleButton = styled.button`
  background-color: transparent;
  width: 100%;
  height: 38px;
  text-align: center;

  border: none;
  margin: 0;
  padding: 0;
  display: block;

  .icon-container {
    background-color: red;
    float: right;
    margin-top: 2px;
    margin-right: 3px;
  }
  .icon-chevron {
    font-size: 0.8rem;
  }
`;

const CustomToggleP = styled.p`
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  background-color: #fff;
  padding: 2px;
  width: 100%;
  height: 38px;
  cursor: default;
  display: inline-block;
`;

const CustomToggleSpan = styled.span`
  background-image: url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e');
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  float: left;
  margin-top: 2px;
  white-space: nowrap;
  background-color: ${props =>
    props.phaseLabel === 'Select a Phase'
      ? '#fff'
      : props.phaseLabel === 'Candidate'
      ? '#ff6c00'
      : props.phaseLabel === 'Recommended'
      ? '#8441de'
      : 'black'};
  border-radius: 14px;
  padding: 2px 32px 2px 14px;
  text-align: left;
  width: 100%;
  font-size: 1rem;
  font-weight: 400;
  color: ${props => (props.phaseLabel === 'Select a Phase' ? 'black' : '#fff')};
`;

const CustomMenu = React.forwardRef(({ children, className }, ref) => {
  const value = '';

  return (
    <div ref={ref} className={className}>
      <ul>
        {React.Children.toArray(children).filter(
          child =>
            !value || child.props.children.toLowerCase().startsWith(value)
        )}
      </ul>
    </div>
  );
});

// You can learn everything about this component here: https://react-bootstrap.netlify.app/docs/components/dropdowns#custom-dropdown-components
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <CustomToggleButton
    ref={ref}
    onClick={e => {
      e.preventDefault();
      onClick(e);
    }}
  >
    <CustomToggleP>
      <CustomToggleSpan phaseLabel={children}>{children}</CustomToggleSpan>
    </CustomToggleP>
  </CustomToggleButton>
));

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
        <Dropdown>
          <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
            {formState.phase || 'Select a Phase'}
          </Dropdown.Toggle>
          <Dropdown.Menu className="drop-down-div" as={CustomMenu}>
            {['Candidate', 'Recommended'].map(phase => (
              <Dropdown.Item
                key={phase}
                className="phase-option"
                onClick={() => handleInputChange('phase', phase)}
              >
                {phase}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
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

CustomToggle.propTypes = {
  children: PropTypes.string,
  onClick: PropTypes.func
};

CustomMenu.propTypes = {
  children: PropTypes.array,
  className: PropTypes.string
};

CreateRequiredReportForm.propTypes = {
  ats: PropTypes.arrayOf(AtPropType).isRequired,
  handleCreate: PropTypes.func.isRequired
};

CreateRequiredReportForm.propTypes = {};
