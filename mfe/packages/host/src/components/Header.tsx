import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../context/AuthContext';

const Header = observer(() => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-pink-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-pink-500">GymApp</Link>
        {user && (
          <nav className="flex items-center gap-6">
            {user.role !== 'admin' && (
              <>
                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-pink-500 transition">Dashboard</Link>
                <Link to="/profile" className="text-sm text-gray-600 hover:text-pink-500 transition">Profile</Link>
                <Link to="/subscriptions" className="text-sm text-gray-600 hover:text-pink-500 transition">Subscriptions</Link>
              </>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" className="text-sm text-gray-600 hover:text-pink-500 transition">Admin Panel</Link>
            )}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <span className="text-sm text-gray-500">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-1.5 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition"
              >
                Logout
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
});

export default Header;
