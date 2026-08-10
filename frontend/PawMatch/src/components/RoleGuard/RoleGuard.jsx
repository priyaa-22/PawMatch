import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UnauthorizedPage from '../../pages/UnauthorizedPage';

export const RoleGuard = ({
  children,
  allowedRoles = null,
  requiredRole = null,
  requiredPermission = null,
}) => {
  const { isAuthenticated, loading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-spinner">Loading session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const checkRole = allowedRoles || requiredRole;
  if (checkRole && !hasRole(checkRole)) {
    return <UnauthorizedPage />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <UnauthorizedPage />;
  }

  return children;
};

export default RoleGuard;
