import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function RoleGuard({ allowedRoles, children, redirectTo = '/signin' }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const roleRoutes = { customer: '/', driver: '/driver', owner: '/owner', admin: '/admin' };
    return <Navigate to={roleRoutes[currentUser.role] || '/signin'} replace />;
  }

  return children;
}
