import React, { Fragment } from 'react';
import { useQuery, gql } from '@apollo/client';
import { renderRoutes } from 'react-router-config';
import { Link, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import routes from '../../routes';
import useSigninUrl from './useSigninUrl';
import './App.css';

const APP_QUERY = gql`
    query {
        me {
            username
            roles
        }
    }
`;

const App = () => {
    const { client, loading, data } = useQuery(APP_QUERY);
    const signinUrl = useSigninUrl();
    const location = useLocation();

    const signOut = async () => {
        await fetch('/api/auth/signout', { method: 'POST' });
        client.resetStore();
    };

    if (loading) return null;

    const isSignedIn = !!(data && data.me && data.me.username);
    const isTester = isSignedIn && data.me.roles.includes('TESTER');
    const isAdmin = isSignedIn && data.me.roles.includes('ADMIN');
    const username = isSignedIn && data.me.username;

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

export default App;
