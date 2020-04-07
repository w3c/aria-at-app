import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { handleLogin } from '../../actions/login';

class App extends Component {
    componentDidMount() {
        const { location, dispatch } = this.props;
        const { login } = queryString.parse(location.search);
        if (login) {
            dispatch(handleLogin());
        }
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
