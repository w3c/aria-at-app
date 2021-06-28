import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const ConfirmAuth = ({ auth, children, requiredPermission, ...rest }) => {
    const { isSignedIn, isAdmin, username, roles } = auth;

    if (!username) return <div>Loading...</div>;

    // If you are an admin, you can access all other role actions by default
    const authConfirmed =
        isSignedIn && (roles.includes(requiredPermission) || isAdmin);

    return (
        <Route
            {...rest}
            render={() => {
                return authConfirmed ? (
                    children
                ) : (
                    <Redirect to={{ pathname: '/404' }} />
                );
            }}
        />
    );
};

const mapStateToProps = state => {
    const { auth } = state;
    return { auth };
};

ConfirmAuth.propTypes = {
    auth: PropTypes.object,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired,
    requiredPermission: PropTypes.string
};

export default connect(mapStateToProps)(ConfirmAuth);
