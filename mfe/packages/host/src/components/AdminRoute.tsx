import React from 'react';
import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../context/AuthContext';

const AdminRoute = observer(({ children }: { children: React.ReactNode }) => {
  const { token, user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-pink-400 animate-pulse text-lg">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
});

export default AdminRoute;
