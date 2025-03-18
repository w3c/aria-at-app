import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const DeleteButton = ({ onClick, ariaLabel }) => {
  return (
    <Button onClick={onClick} aria-label={ariaLabel} variant="danger">
      <FontAwesomeIcon icon={faTrash} /> Delete
    </Button>
  );
};

DeleteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired
};

export default DeleteButton;
