import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Shield className="text-blue-500 w-6 h-6" />
          <span className="text-xl font-bold text-white">
            Rate Limiter UI
          </span>
        </Link>

        <div>
          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'admin' && (
                <Link to="/dashboard" className="text-blue-500 font-medium hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
              )}
              <span className="text-gray-300">
                Welcome, <strong className="text-white">{user.username}</strong>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
