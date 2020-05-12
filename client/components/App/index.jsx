import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import { renderRoutes } from 'react-router-config';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { handleCheckSignedIn, handleSignout } from '../../actions/user';
import { getAllUsers } from '../../actions/users';
import { handleGetValidAts } from '../../actions/ats';

class App extends Component {
    constructor(props) {
        super(props);

        this.signOut = this.signOut.bind(this);
        this.state = {
            ready: false
        };
    }
    async componentDidMount() {
        const { dispatch } = this.props;

        await dispatch(handleCheckSignedIn());
        await dispatch(handleGetValidAts());
        await dispatch(getAllUsers());

        this.setState({ ready: true });
    }

    async signOut() {
        const { dispatch } = this.props;
        await dispatch(handleSignout());
        // Avoid the flash of "logged in user" after
        // pressing "log out"
        location.href = '/';
    }

    render() {
        const { ready } = this.state;
        // This is used to prevent the flash of "unauthorized user"
        if (!ready) {
            return null;
        }
        const { route, isSignedIn, isAdmin, isTester } = this.props;
        const signInURL = `${process.env.API_SERVER}/api/auth/oauth?referer=${location.origin}&service=github`;
        return (
            <Fragment>
                <Container fluid>
                    <Navbar bg="light" expand="lg">
                        <Navbar.Brand as={Link} to="/">
                            <h1>ARIA-AT Report</h1>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse
                            id="basic-navbar-nav"
                            className="justify-content-end"
                        >
                            {(!isSignedIn && (
                                <Nav.Link
                                    as={Link}
                                    to="/"
                                    onClick={() =>
                                        (window.location.href = signInURL)
                                    }
                                >
                                    Sign in with GitHub
                                </Nav.Link>
                            )) || (
                                <React.Fragment>
                                    {isAdmin && (
                                        <Nav.Link as={Link} to="/cycles">
                                            Test Management
                                        </Nav.Link>
                                    )}
                                    {isTester && (
                                        <Nav.Link as={Link} to="/test-queue">
                                            Test Queue
                                        </Nav.Link>
                                    )}
                                    <Nav.Link as={Link} to="/account/settings">
                                        Settings
                                    </Nav.Link>
                                    <Nav.Link
                                        as={Link}
                                        to="/"
                                        onClick={this.signOut}
                                    >
                                        Sign out
                                    </Nav.Link>
                                </React.Fragment>
                            )}
                        </Navbar.Collapse>
                    </Navbar>
                </Container>
                <Container as="main" fluid>
                    {renderRoutes(route.routes)}
                </Container>
            </Fragment>
        );
    }
}

App.propTypes = {
    dispatch: PropTypes.func,
    isSignedIn: PropTypes.bool,
    isAdmin: PropTypes.bool,
    isTester: PropTypes.bool,
    location: PropTypes.object,
    route: PropTypes.object
};

const mapStateToProps = state => {
    const { isSignedIn, roles } = state.user;
    let isAdmin = roles ? roles.includes('admin') : false;
    let isTester = isAdmin || (roles && roles.includes('tester'));
    return { isSignedIn, isAdmin, isTester };
};

export default connect(mapStateToProps)(App);
