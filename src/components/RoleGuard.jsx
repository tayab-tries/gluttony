import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthDemo } from '../lib/AuthDemoContext';

export default function RoleGuard({ allowedRoles, children, redirectTo = '/signin' }) {
  const { currentUser } = useAuthDemo();

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const roleRoutes = { customer: '/', driver: '/driver', owner: '/owner', admin: '/admin' };
    return <Navigate to={roleRoutes[currentUser.role] || '/signin'} replace />;
  }

  return children;
}