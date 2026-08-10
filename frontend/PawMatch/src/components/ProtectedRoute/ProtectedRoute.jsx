import React from 'react';
import RoleGuard from '../RoleGuard/RoleGuard';

export const ProtectedRoute = (props) => {
  return <RoleGuard {...props} />;
};

export default ProtectedRoute;
