import React from 'react';
import { Navigate } from 'react-router';
import { useAppSelector } from '../app/hooks';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'Manager' | 'Employee')[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
