import React from 'react';
import { Button } from 'react-bootstrap';

const Login = () => {
    const loginURL = `${process.env.API_SERVER}/api/auth/login?referer=${location.origin}&service=github`;
    return (
        <Button variant="primary" onClick={() => (window.location.href = loginURL)}>
            Login with GitHub
        </Button>
    );
};

export default Login;
