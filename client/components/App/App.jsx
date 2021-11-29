import React, { useEffect, useState } from 'react';
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
import SkipLink from '../SkipLink';
import './App.css';

const App = () => {
    const location = useLocation();
    const signinUrl = useSigninUrl();
    const { client, loading, data } = useQuery(ME_QUERY);
    const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);

    const auth = evaluateAuth(data && data.me ? data.me : {});
    const { username, isSignedIn } = auth;

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
                    aria-label="Main"
                    expanded={isNavbarExpanded}
                    onToggle={() => setIsNavbarExpanded(previous => !previous)}
                >
                    <h2 id="main-menu-heading" className="sr-only">
                        Main Navigation
                    </h2>
                    <Navbar.Brand
                        className="logo"
                        as={Link}
                        to="/"
                        aria-current={location.pathname === '/'}
                    >
                        ARIA-AT
                    </Navbar.Brand>
                    <SkipLink />
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse
                        id="basic-navbar-nav"
                        className="justify-content-end"
                    >
                        <ul aria-labelledby="main-menu-heading">
                            <li>
                                <Nav.Link
                                    as={Link}
                                    to="/reports"
                                    aria-current={location.pathname.startsWith(
                                        '/reports'
                                    )}
                                >
                                    Test Reports
                                </Nav.Link>
                            </li>
                            <li>
                                <Nav.Link
                                    as={Link}
                                    to="/test-queue"
                                    aria-current={
                                        location.pathname === '/test-queue'
                                    }
                                >
                                    Test Queue
                                </Nav.Link>
                            </li>
                            {isSignedIn && (
                                <>
                                    <li>
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
                                    </li>
                                    <li className="signed-in-wrapper">
                                        <Nav.Link
                                            as={Link}
                                            to="/"
                                            onClick={signOut}
                                            aria-describedby="signed-in"
                                        >
                                            Sign out
                                        </Nav.Link>
                                        <div
                                            className="signed-in"
                                            id="signed-in"
                                        >
                                            <FontAwesomeIcon
                                                icon={faUserCircle}
                                            />
                                            Signed in as <b>{username}</b>
                                        </div>
                                    </li>
                                </>
                            )}
                            {!isSignedIn && (
                                <li>
                                    <Nav.Link
                                        as={Link}
                                        to="#"
                                        onClick={() =>
                                            (window.location.href = signinUrl)
                                        }
                                    >
                                        Sign in with GitHub
                                    </Nav.Link>
                                </li>
                            )}
                        </ul>
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
