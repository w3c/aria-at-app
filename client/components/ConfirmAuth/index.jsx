import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';

const ConfirmAuth = ({ children, requiredPermission, requireVendorForAt }) => {
  const { data } = useQuery(ME_QUERY);
  const { atId } = useParams();

  const auth = evaluateAuth(data && data.me ? data.me : {});
  const { roles, username, isAdmin, isSignedIn } = auth;
  const company = data && data.me ? data.me.company : null;

  if (!username) return <Navigate to={{ pathname: '/invalid-request' }} />;

  // If you are an admin, you can access all other role actions by default
  const authConfirmed =
    isSignedIn && (roles.includes(requiredPermission) || isAdmin);

  if (!authConfirmed) {
    return <Navigate to="/404" replace />;
  }

  // Check if the user's company is the vendor for the associated At
  if (requireVendorForAt && !isAdmin) {
    const isVendorForAt = company && company.ats.some(at => at.id === atId);
    if (!isVendorForAt) {
      return <Navigate to="/404" replace />;
    }
  }

  return children;
};

ConfirmAuth.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  requiredPermission: PropTypes.string,
  requireVendorForAt: PropTypes.bool
};

export default ConfirmAuth;
