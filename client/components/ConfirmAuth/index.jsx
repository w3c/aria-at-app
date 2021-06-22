import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { gql, useQuery } from '@apollo/client';

const APP_QUERY = gql`
    query {
        me {
            username
            roles
        }
    }
`;

const ConfirmAuth = ({ children, requiredPermission, ...rest }) => {
    // TODO: Perhaps use context/redux to pass these down to all children
    const { client, loading, data } = useQuery(APP_QUERY);

    const isSignedIn = !!(data && data.me && data.me.username);
    const isTester = isSignedIn && data.me.roles.includes('TESTER');
    const isAdmin = isSignedIn && data.me.roles.includes('ADMIN');
    const username = isSignedIn && data.me.username;

    if (!username) return <div>Loading...</div>;

    // If you are an admin, you can all other roles by default
    const authConfirmed =
        isSignedIn &&
        (data.me.roles.includes(requiredPermission) ||
            data.me.roles.includes('admin'));

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

function mapStateToProps(state) {
    const { isSignedIn, username, roles, loadedUserData } = state.user;
    return { isSignedIn, username, roles, loadedUserData };
}

ConfirmAuth.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired,
    requiredPermission: PropTypes.string
};

export default connect(mapStateToProps, null)(ConfirmAuth);
