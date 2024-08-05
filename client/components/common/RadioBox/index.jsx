import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

const ContainerDiv = styled.div`
  display: flex;
`;

const Label = styled.label`
  border: 1px solid #ced4da;
  padding: 0.375rem 0.9rem 0.375rem 0.75rem;
  background-color: ${props =>
    props.applyCheckedStyles ? `#F6F8FA` : 'white'};

  &:first-of-type {
    border-radius: 0.375rem 0 0 0.375rem;
  }
  &:last-of-type {
    border-radius: 0 0.375rem 0.375rem 0;
  }
  &:not(:last-of-type) {
    border-right: none;
  }
`;

const Input = styled.input`
  margin-right: 0.375rem;
`;

const RadioBox = ({ name, labels, selectedLabel, onSelect }) => {
  const getOnChange = label => event => {
    if (event.target.checked) onSelect(label);
  };

  return (
    <ContainerDiv>
      {labels.map(label => {
        const isChecked = selectedLabel === label;
        return (
          <Label key={label} applyCheckedStyles={isChecked}>
            <Input
              type="radio"
              name={name}
              checked={isChecked}
              onChange={getOnChange(label)}
            />
            <TextThatWontShiftWhenBold isBold={isChecked}>
              {label}
            </TextThatWontShiftWhenBold>
          </Label>
        );
      })}
    </ContainerDiv>
  );
};

const TextThatWontShiftWhenBold = ({ isBold, children: text }) => {
  return (
    <span style={{ position: 'relative' }}>
      <span
        style={{
          position: 'absolute',
          fontWeight: isBold ? 'bold' : 'normal'
        }}
      >
        {text}
      </span>
      <span aria-hidden={true} style={{ fontWeight: 'bold', opacity: 0 }}>
        {text}
      </span>
    </span>
  );
};

TextThatWontShiftWhenBold.propTypes = {
  isBold: PropTypes.bool.isRequired,
  children: PropTypes.string.isRequired
};

RadioBox.propTypes = {
  name: PropTypes.string.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  selectedLabel: PropTypes.string,
  onSelect: PropTypes.func.isRequired
};

export default RadioBox;
