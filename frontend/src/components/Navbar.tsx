import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-white shadow-sm border-b border-pink-100 px-6 py-3 flex items-center justify-between">
      <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent">
        GymApp
      </Link>
      <div className="flex items-center gap-4">
        {user?.role === 'admin' ? (
          <Link to="/admin" className="text-sm text-purple-500 hover:text-purple-600 font-medium">Admin Panel</Link>
        ) : (
          <>
            <Link to="/dashboard" className="text-sm text-pink-500 hover:text-pink-600 font-medium">Dashboard</Link>
            <Link to="/profile" className="text-sm text-pink-500 hover:text-pink-600 font-medium">Profile</Link>
            <Link to="/subscriptions" className="text-sm text-pink-500 hover:text-pink-600 font-medium">Subscriptions</Link>
          </>
        )}
        <span className="text-sm text-gray-400">Hi, {user?.name}</span>
        <button
          onClick={handleLogout}
          className="text-sm bg-gradient-to-r from-pink-400 to-pink-500 text-white px-4 py-1.5 rounded-full hover:opacity-90 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
