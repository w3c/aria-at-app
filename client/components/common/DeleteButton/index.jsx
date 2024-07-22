import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const StyledDeleteButton = styled(Button)`
  color: #ce1b4c;

  &:hover {
    background: #ce1b4c;
    color: white;
  }
`;

const DeleteButton = ({ onClick, ariaLabel }) => {
  return (
    <StyledDeleteButton
      onClick={onClick}
      aria-label={ariaLabel}
      variant="secondary"
    >
      <FontAwesomeIcon icon={faTrash} /> Delete
    </StyledDeleteButton>
  );
};

DeleteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired
};

export default DeleteButton;
