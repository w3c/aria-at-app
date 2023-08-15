import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
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
    const { username, isSignedIn, isAdmin, isVendor } = auth;

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
                    aria-label="Menu"
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
                    <SkipLink />
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse
                        id="basic-navbar-nav"
                        className="justify-content-end"
                    >
                        <Nav>
                            <li>
                                <Nav.Link
                                    as={Link}
                                    to="/reports"
                                    aria-current={location.pathname.startsWith(
                                        '/report'
                                    )}
                                >
                                    Test Reports
                                </Nav.Link>
                            </li>
                            <li>
                                <Nav.Link
                                    as={Link}
                                    to="/data-management"
                                    aria-current={
                                        location.pathname === '/data-management'
                                    }
                                >
                                    Data Management
                                </Nav.Link>
                            </li>
                            <li>
                                <Nav.Link
                                    as={Link}
                                    to="/test-queue"
                                    aria-current={
                                        location.pathname.includes(
                                            '/test-queue'
                                        ) ||
                                        location.pathname.includes('/run') ||
                                        location.pathname.includes(
                                            '/test-plan-report'
                                        )
                                    }
                                >
                                    Test Queue
                                </Nav.Link>
                            </li>
                            {isSignedIn && (isAdmin || isVendor) && (
                                <li>
                                    <Nav.Link
                                        as={Link}
                                        to="/candidate-review"
                                        aria-current={location.pathname.startsWith(
                                            '/candidate'
                                        )}
                                    >
                                        Candidate Review
                                    </Nav.Link>
                                </li>
                            )}
                            {isSignedIn && (
                                <>
                                    {!isVendor && (
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
                                    )}
                                    <li className="signed-in-wrapper">
                                        <div
                                            className="signed-in"
                                            id="signed-in"
                                        >
                                            <FontAwesomeIcon
                                                icon={faUserCircle}
                                            />
                                            Signed in as <b>{username}</b>
                                        </div>
                                        <Nav.Link
                                            as={Link}
                                            to="/"
                                            onClick={signOut}
                                            aria-describedby="signed-in"
                                        >
                                            Sign out
                                        </Nav.Link>
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
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </Container>
            <Container fluid>{routes()}</Container>
        </ScrollFixer>
    );
};

export default App;
