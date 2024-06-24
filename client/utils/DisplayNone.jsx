import React from 'react';
import PropTypes from 'prop-types';

const DisplayNone = ({ children }) => {
  return <div style={{ display: 'none' }}>{children}</div>;
};

DisplayNone.propTypes = {
  children: PropTypes.node.isRequired
};

export default DisplayNone;
