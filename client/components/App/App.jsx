import React, { Fragment, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { renderRoutes } from 'react-router-config';
import { Link, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { evaluateAuth } from '../../utils/evaluateAuth';
import ScrollFixer from '../../utils/ScrollFixer';
import routes from '../../routes';
import { ME_QUERY } from './queries';
import useSigninUrl from './useSigninUrl';
import './App.css';

const App = () => {
    const location = useLocation();
    const signinUrl = useSigninUrl();
    const { client, loading, data } = useQuery(ME_QUERY);
    const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);

    const auth = evaluateAuth(data && data.me ? data.me : {});
    const { username, isTester, isSignedIn } = auth;

    const signOut = async () => {
        await fetch('/api/auth/signout', { method: 'POST' });
        await client.resetStore();
    };

    useEffect(() => {
        setIsNavbarExpanded(false);
    }, [location]);

    if (loading) return null;

    return (
        <ScrollFixer>
            <Container fluid>
                <Navbar
                    bg="light"
                    expand="lg"
                    aria-label="Main Menu"
                    expanded={isNavbarExpanded}
                    onToggle={() => setIsNavbarExpanded(previous => !previous)}
                >
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
                                    aria-current={location.pathname.startsWith(
                                        '/reports'
                                    )}
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
                                    aria-current={location.pathname.startsWith(
                                        '/reports'
                                    )}
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
        </ScrollFixer>
    );
};

export default App;
