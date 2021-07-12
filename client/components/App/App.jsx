import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    signIn as signInAction,
    signOut as signOutAction
} from '../../redux/actions/auth';
import { useQuery } from '@apollo/client';
import { renderRoutes } from 'react-router-config';
import { Link, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { ME_QUERY } from '../TestQueue/queries';
import routes from '../../routes';
import useSigninUrl from './useSigninUrl';
import './App.css';

const App = ({ auth, dispatch }) => {
    const { client, error, loading, data } = useQuery(ME_QUERY);
    const signinUrl = useSigninUrl();
    const location = useLocation();

    const { isSignedIn, isSignOutCalled, isTester, isAdmin, username } = auth;

    const signOut = async () => {
        dispatch(signOutAction());
        await fetch('/api/auth/signout', { method: 'POST' });
        await client.resetStore();
    };

    if (loading) return null;

    // cache still being used to prevent redux refresh unless browser refreshed
    // for some instances. `isSignOutCalled` boolean helps prevent this
    if (!isSignOutCalled && !username && data && data.me)
        dispatch(signInAction(data.me));

    if (error) {
        // TODO: Display error message / page for failed user auth attempt
        // dispatch(signInFailAction());
    }

    return (
        <Fragment>
            <Container fluid>
                <Navbar bg="light" expand="lg" aria-label="Main Menu">
                    <Navbar.Brand
                        className="logo"
                        as={Link}
                        to="/"
                        aria-current={location.pathname === '/'}
                    >
                        ARIA-AT
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse
                        id="basic-navbar-nav"
                        className="justify-content-end"
                    >
                        {(!isSignedIn && (
                            <Fragment>
                                <Nav.Link
                                    as={Link}
                                    to="/reports"
                                    aria-current={
                                        location.pathname === '/reports'
                                    }
                                >
                                    Test Reports
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/"
                                    onClick={() =>
                                        (window.location.href = signinUrl)
                                    }
                                >
                                    Sign in with GitHub
                                </Nav.Link>
                            </Fragment>
                        )) || (
                            <Fragment>
                                <Nav.Link
                                    as={Link}
                                    to="/reports"
                                    aria-current={
                                        location.pathname === '/reports'
                                    }
                                >
                                    Test Reports
                                </Nav.Link>
                                {isTester && (
                                    <Nav.Link
                                        as={Link}
                                        to="/test-queue"
                                        aria-current={
                                            location.pathname === '/test-queue'
                                        }
                                    >
                                        Test Queue
                                    </Nav.Link>
                                )}
                                {isAdmin && (
                                    <Nav.Link
                                        as={Link}
                                        to="/admin/configure-runs"
                                        aria-current={
                                            location.pathname ===
                                            '/admin/configure-runs'
                                        }
                                    >
                                        Test Configuration
                                    </Nav.Link>
                                )}
                                <Nav.Link
                                    as={Link}
                                    to="/account/settings"
                                    aria-current={
                                        location.pathname ===
                                        '/account/settings'
                                    }
                                >
                                    Settings
                                </Nav.Link>
                                <Nav.Link as={Link} to="/" onClick={signOut}>
                                    Sign out
                                </Nav.Link>
                                <div className="signed-in">
                                    <FontAwesomeIcon icon={faUserCircle} />
                                    Signed in as <b>{username}</b>
                                </div>
                            </Fragment>
                        )}
                    </Navbar.Collapse>
                </Navbar>
            </Container>
            <Container fluid>
                <div>{renderRoutes(routes)}</div>
            </Container>
        </Fragment>
    );
};

App.propTypes = {
    auth: PropTypes.object,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { auth } = state;
    return { auth };
};

export default connect(mapStateToProps)(App);
