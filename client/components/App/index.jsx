import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container, Navbar, NavDropdown } from 'react-bootstrap';
import { handleCheckLoggedIn, handleLogout } from '../../actions/login';

class App extends Component {
    constructor(props) {
        super(props);

        this.logout = this.logout.bind(this);
    }
    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(handleCheckLoggedIn());
    }

    logout() {
        const { dispatch } = this.props;
        dispatch(handleLogout());
    }

    render() {
        const { route, isLoggedIn } = this.props;
        return (
            <Fragment>
                <Container fluid>
                    <Navbar bg="light" expand="lg">
                        <Navbar.Brand href="/"><h1>ARIA-AT Report</h1></Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse
                            id="basic-navbar-nav"
                        >
                            <NavDropdown title="Menu">
                                {(!isLoggedIn && (
                                    <NavDropdown.Item>
                                        <Link to="/login">Login</Link>
                                    </NavDropdown.Item>
                                )) || (
                                    <NavDropdown.Item>
                                        <Link
                                            to="/"
                                            onClick={this.logout}
                                        >
                                            Logout
                                        </Link>
                                    </NavDropdown.Item>
                                )}
                                <NavDropdown.Item>
                                    <Link to="/account/settings">Settings</Link>
                                </NavDropdown.Item>
                                <NavDropdown.Item>
                                    <Link to="/cycles">
                                        Testing Cycle Management
                                    </Link>
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Navbar.Collapse>
                    </Navbar>
                </Container>
                {renderRoutes(route.routes)}
            </Fragment>
        );
    }
}

App.propTypes = {
    dispatch: PropTypes.func,
    isLoggedIn: PropTypes.bool,
    location: PropTypes.object,
    route: PropTypes.object
};

const mapStateToProps = state => {
    const { isLoggedIn } = state.login;
    return { isLoggedIn };
};

export default connect(mapStateToProps)(App);
