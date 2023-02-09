import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';

const ConfirmAuth = ({ children, requiredPermission, ...rest }) => {
    const { data } = useQuery(ME_QUERY);

    const auth = evaluateAuth(data && data.me ? data.me : {});
    const { roles, username, isAdmin, isSignedIn } = auth;

    if (!username) return <Navigate to={{ pathname: '/invalid-request' }} />;

    // If you are an admin, you can access all other role actions by default
    const authConfirmed =
        isSignedIn && (roles.includes(requiredPermission) || isAdmin);

    if (!authConfirmed) {
        return <Navigate to="/404" replace />
    }

    return children;
};

ConfirmAuth.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired,
    requiredPermission: PropTypes.string
};

export default ConfirmAuth;
