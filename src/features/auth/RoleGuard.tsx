import React from 'react';
import { Navigate } from 'react-router';
import { useAppSelector } from '../../app/hooks';
import { hasPermission, type Permission } from '../../lib/permissions';

interface RoleGuardProps {
  requiredPermission: Permission;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ requiredPermission, children }) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(user.role, requiredPermission)) {
    const defaultLanding = user.role === 'Employee' ? '/products' : '/dashboard';
    return <Navigate to={defaultLanding} replace />;
  }

  return <>{children}</>;
};
export default RoleGuard;
