import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import { renderRoutes } from 'react-router-config';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container, Col, Navbar, Nav, Row } from 'react-bootstrap';
import { handleCheckSignedIn, handleSignout } from '../../actions/user';
import { getAllUsers } from '../../actions/users';
import { handleGetValidAts } from '../../actions/ats';

class App extends Component {
    constructor(props) {
        super(props);

        this.signOut = this.signOut.bind(this);
        this.currentNavItem = React.createRef();
    }

    async componentDidMount() {
        const { dispatch } = this.props;

        dispatch(handleCheckSignedIn());
        dispatch(handleGetValidAts());
        dispatch(getAllUsers());
    }

    componentDidUpdate(prevProps) {
        // Focus on the navigation link after updating the page
        if (this.props.location.pathname !== prevProps.location.pathname) {
            if (this.currentNavItem.current) {
                this.currentNavItem.current.focus();
            }
        }
    }

    async signOut() {
        const { dispatch } = this.props;
        await dispatch(handleSignout());
        // Avoid the flash of "logged in user" after
        // pressing "log out"
        window.location.href = '/';
    }

    navProps(href) {
        const { location } = this.props;

        let navProps = {
            to: href
        };

        if (location.pathname === href) {
            navProps['aria-current'] = true;
            navProps['ref'] = this.currentNavItem;
        }

        return navProps;
    }

    render() {
        const { loadedUserData } = this.props;
        // This is used to prevent the flash of "unauthorized user"
        if (!loadedUserData) {
            return null;
        }

        const { route, isSignedIn, isAdmin, isTester } = this.props;
        const signInURL = `${process.env.API_SERVER}/api/auth/oauth?referer=${window.location.origin}&service=github`;

        return (
            <Fragment>
                <Container fluid>
                    <Navbar bg="light" expand="lg">
                        <Navbar.Brand
                            className="logo"
                            as={Link}
                            {...this.navProps('/')}
                        >
                            ARIA-AT
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
                                        <Nav.Link
                                            as={Link}
                                            {...this.navProps('/admin/configure-runs')}
                                        >
                                            Configure Active Runs
                                        </Nav.Link>
                                    )}
                                    {isTester && (
                                        <Nav.Link
                                            as={Link}
                                            {...this.navProps('/test-queue')}
                                        >
                                            Test Queue
                                        </Nav.Link>
                                    )}
                                    <Nav.Link
                                        as={Link}
                                        {...this.navProps('/results')}
                                    >
                                        Test Reports
                                    </Nav.Link>
                                    <Nav.Link
                                        as={Link}
                                        {...this.navProps('/account/settings')}
                                    >
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
                    <Row>
                        <Col>{renderRoutes(route.routes)}</Col>
                    </Row>
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
    route: PropTypes.object,
    loadedUserData: PropTypes.bool
};

const mapStateToProps = state => {
    const { isSignedIn, loadedUserData, roles } = state.user;
    let isAdmin = roles ? roles.includes('admin') : false;
    let isTester = isAdmin || (roles && roles.includes('tester'));
    return { isSignedIn, isAdmin, isTester, loadedUserData };
};

export default connect(mapStateToProps)(App);
