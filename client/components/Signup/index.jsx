import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

class Signup extends Component {
    render() {
        const signupURL = `${process.env.API_SERVER}/api/auth/oauth?referer=${location.origin}&service=github&type=signup`;
        return (
            <Button
                variant="primary"
                onClick={
                    this.props.onClick
                        ? this.props.onClick
                        : () => (window.location.href = signupURL)
                }
            >
                Sign up with GitHub
            </Button>
        );
    }
}

Signup.propTypes = {
    onClick: PropTypes.func
};

export default Signup;
