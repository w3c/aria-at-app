import React, { Fragment } from 'react';
import { useQuery, gql } from '@apollo/client';
import { renderRoutes } from 'react-router-config';
import { BrowserRouter, Link } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import routes from '../../routes';
import './App.css';

const APP_QUERY = gql`
    query {
        me {
            username
            roles
        }
    }
`;

const useLoginUrl = () => {
    // Allows for quickly logging in with different roles - changing
    // roles would otherwise require leaving and joining GitHub teams
    const matchedFakeRole = location.href.match(/fakeRole=(\w*)/);
    let dataFromFrontend = '';
    if (matchedFakeRole) {
        dataFromFrontend += `fakeRole-${matchedFakeRole[1]}`;
    }
    return (
        `${process.env.API_SERVER}/api/auth/oauth?dataFromFrontend=` +
        dataFromFrontend
    );
};

const App = () => {
    const { loading, data } = useQuery(APP_QUERY);
    const loginUrl = useLoginUrl();

    if (loading) return null;

    const isLoggedIn = !!(data.me && data.me.username);
    const isTester = data.me && data.me.roles.includes('TESTER');
    const isAdmin = data.me && data.me.roles.includes('ADMIN');
    const username = data.me && data.me.username;

    return (
        <BrowserRouter>
            <Container fluid>
                <Navbar bg="light" expand="lg" aria-label="Main Menu">
                    <Navbar.Brand
                        className="logo"
                        as={Link}
                        to="/"
                        // TODO: reenable
                        // {...this.navProps('/')}
                    >
                        ARIA-AT
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse
                        id="basic-navbar-nav"
                        className="justify-content-end"
                    >
                        {(!isLoggedIn && (
                            <Fragment>
                                <Nav.Link
                                    as={Link}
                                    to="/reports"
                                    // TODO: reenable
                                    // {...this.navProps('/reports')}
                                >
                                    Test Reports
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/"
                                    onClick={() =>
                                        (window.location.href = loginUrl)
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
                                    // TODO: reenable
                                    // {...this.navProps('/reports')}
                                >
                                    Test Reports
                                </Nav.Link>
                                {isTester && (
                                    <Nav.Link
                                        as={Link}
                                        to="/test-queue"
                                        // TODO: reenable
                                        // {...this.navProps('/test-queue')}
                                    >
                                        Test Queue
                                    </Nav.Link>
                                )}
                                {isAdmin && (
                                    <Nav.Link
                                        as={Link}
                                        to="/admin/configure-runs"
                                        // TODO: reenable
                                        // {...this.navProps(
                                        //     '/admin/configure-runs'
                                        // )}
                                    >
                                        Test Configuration
                                    </Nav.Link>
                                )}
                                <Nav.Link
                                    as={Link}
                                    to="/account/settings"
                                    // TODO: reenable
                                    // {...this.navProps('/account/settings')}
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
        </BrowserRouter>
    );
};

export default App;
