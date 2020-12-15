import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ATAlert.css';

class ATAlert extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { message } = this.props;
        return (
            <div className="at-alert" role="status" aria-live="polite">
                {message}
            </div>
        );
    }
}

ATAlert.propTypes = {
    message: PropTypes.string
};

export default ATAlert;
