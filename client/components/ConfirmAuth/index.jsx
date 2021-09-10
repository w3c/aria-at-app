import React, { useContext, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { StoreContext as store } from '../../store';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../App/queries';
import { signIn as signInAction } from '../../store/auth';

const ConfirmAuth = ({ children, requiredPermission, ...rest }) => {
    const { data } = useQuery(ME_QUERY);
    const [state, dispatch] = useContext(store);
    const { auth } = state;
    const { isSignOutCalled, isSignedIn, isAdmin, username, roles } = auth;

    useEffect(() => {
        if (!isSignOutCalled && !username && data && data.me)
            dispatch(signInAction(data.me));
    }, [data, auth]);

    // to explicitly inform user that something went wrong when signing in
    // need to provide assistance on troubleshooting should this ever happen
    if (!username) return <Redirect to={{ pathname: '/invalid-request' }} />;

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

ConfirmAuth.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired,
    requiredPermission: PropTypes.string
};

export default ConfirmAuth;
