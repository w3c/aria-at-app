import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { handleLogin } from '../../actions/login';
import { getTestCycles } from '../../actions/cycles';

class App extends Component {
    componentDidMount() {
        const { location, dispatch } = this.props;
        const { login } = queryString.parse(location.search);
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
            <div>
                <h1>ARIA-AT REPORT</h1>
                <Link to="/login">Login</Link>
                <br></br>
                <Link to="/account/settings">Settings</Link>
                {renderRoutes(route.routes)}
            </div>
        );
    }
}

App.propTypes = {
    route: PropTypes.object,
    location: PropTypes.object,
    dispatch: PropTypes.func
};

export default connect()(App);
