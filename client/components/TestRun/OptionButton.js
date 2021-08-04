import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const OptionButton = ({
    text,
    icon = null,
    disabled = false,
    onClick = () => {},
    children
}) => {
    return (
        <Button
            className="btn-block"
            variant="secondary"
            onClick={onClick}
            disabled={disabled}
        >
            {icon}
            {text || children}
        </Button>
    );
};

OptionButton.propTypes = {
    text: PropTypes.string,
    icon: PropTypes.node,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    children: PropTypes.node
};

export default OptionButton;
