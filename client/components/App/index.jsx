import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Navbar, NavDropdown } from 'react-bootstrap';
import queryString from 'query-string';
import { handleLogin } from '../../actions/login';
import { getTestCycles } from '../../actions/cycles';

class App extends Component {
    componentDidMount() {
        const { location, dispatch } = this.props;
        const { login } = queryString.parse(location.search);
        console.log('COMPONENT DID MOUNT - APP');

        if (login) {
            dispatch(handleLogin());
        }

        // TODO: I don't think this is the appropriate place to get this into the application
        // maybe I should do this on the testCycles app. Or, maybe I should only do this AFTER log in...?
        dispatch(getTestCycles());
    }
    render() {
        const { route } = this.props;
        return (
            <Fragment>
              <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home">ARIA-AT Report</Navbar.Brand>
                <Navbar.Text><Link to="/login">Login</Link></Navbar.Text>
                  <NavDropdown title="Stuff">
                    <NavDropdown.Item><Link to="/account/settings">Settings</Link></NavDropdown.Item>
                    <NavDropdown.Item><Link to="/cycles">Testing Cycle Management</Link></NavDropdown.Item>
                  </NavDropdown>
              </Navbar>
              {renderRoutes(route.routes)}
            </Fragment>
        );
    }
}

App.propTypes = {
    route: PropTypes.object,
    location: PropTypes.object,
    dispatch: PropTypes.func
};

export default connect()(App);
