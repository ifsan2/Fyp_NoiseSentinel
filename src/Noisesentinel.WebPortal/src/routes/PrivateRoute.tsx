import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/common/Loading';
import { ROUTES, ROLES } from '@/utils/constants';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[]; // ✅ ADD: Support multiple roles
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRole,
  allowedRoles, // ✅ ADD
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Checking authentication..." fullScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login, save the attempted location
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // ✅ Block Police Officers from web portal
  if (user?.role === ROLES.POLICE_OFFICER) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // ✅ Check if user has required role
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // ✅ Check if user has one of allowed roles
  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};