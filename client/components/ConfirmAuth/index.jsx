import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const ConfirmAuth = ({
    children,
    isAuthorized,
    roles,
    requiredPermission,
    loadedUserData,
    isLoggedIn,
    ...rest
}) => {
    if (!loadedUserData) {
        return <div>Loading...</div>;
    }

    let AuthConfirmed = isAuthorized;
    if (!AuthConfirmed) {
        // If you are an admin, you can all other roles by default
        AuthConfirmed =
            isLoggedIn &&
            (roles.includes(requiredPermission) || roles.includes('admin'));
    }

    return (
        <Route
            {...rest}
            render={() => {
                return AuthConfirmed ? (
                    children
                ) : (
                    <Redirect to={{ pathname: '/404' }} />
                );
            }}
        />
    );
};

function mapStateToProps(state) {
    const { isLoggedIn, username, roles, loadedUserData } = state.login;
    return { isLoggedIn, username, roles, loadedUserData };
}

ConfirmAuth.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired,
    isAuthorized: PropTypes.bool,
    isLoggedIn: PropTypes.bool,
    loadedUserData: PropTypes.bool,
    roles: PropTypes.array,
    requiredPermission: PropTypes.string
};

export default connect(mapStateToProps, null)(ConfirmAuth);
