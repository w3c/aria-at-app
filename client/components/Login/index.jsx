import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';

class Login extends Component {
    render() {
        const { isLoggedIn } = this.props;
        const loginURL = `${process.env.API_SERVER}/api/auth/oauth?referer=${location.origin}&service=github&type=login`;
        return (
            !isLoggedIn && (
                <Button
                    variant="primary"
                    onClick={() => (window.location.href = loginURL)}
                >
                    Login with GitHub
                </Button>
            )
        );
    }
}

Login.propTypes = {
    isLoggedIn: PropTypes.bool
};

const mapStateToProps = state => {
    const { isLoggedIn } = state.login;
    return { isLoggedIn };
};

export default connect(mapStateToProps)(Login);
