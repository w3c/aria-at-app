import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';

class Login extends Component {
    render() {
        const { isLoggedIn } = this.props;
        const loginURL = `${process.env.API_SERVER}/api/auth/login?referer=${location.origin}&service=github`;
        return(
            !isLoggedIn 
            && <Button
                variant="primary"
                onClick={() => (window.location.href = loginURL)}
            >
                Login with GitHub
            </Button>
            || <p>Logged In</p>
        );
    }
}

const mapStateToProps = state => {
    const { isLoggedIn } = state.login;
    return { isLoggedIn };
};

export default connect(mapStateToProps)(Login);
