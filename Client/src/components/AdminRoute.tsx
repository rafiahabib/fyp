import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  redirectTo?: string;
}

export default function AdminRoute({ redirectTo = '/dashboard' }: AdminRouteProps) {
  const { isAdmin, user } = useAuth();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If not admin, redirect to specified page
  if (!isAdmin()) {
    return <Navigate to={redirectTo} replace />;
  }

  // If admin, render the protected route
  return <Outlet />;
} 