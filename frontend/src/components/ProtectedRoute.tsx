import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="text-pink-400 text-xl font-semibold animate-pulse">Loading...</div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
