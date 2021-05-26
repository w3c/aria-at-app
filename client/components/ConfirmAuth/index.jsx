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
    isSignedIn,
    ...rest
}) => {
    if (!loadedUserData) {
        return <div>Loading...</div>;
    }

    let AuthConfirmed = isAuthorized;
    if (!AuthConfirmed) {
        // If you are an admin, you can all other roles by default
        AuthConfirmed =
            isSignedIn &&
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
    const { isSignedIn, username, roles, loadedUserData } = state.user;
    return { isSignedIn, username, roles, loadedUserData };
}

ConfirmAuth.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    isAuthorized: PropTypes.bool,
    isSignedIn: PropTypes.bool,
    loadedUserData: PropTypes.bool,
    roles: PropTypes.array,
    requiredPermission: PropTypes.string,
};

export default connect(mapStateToProps, null)(ConfirmAuth);
