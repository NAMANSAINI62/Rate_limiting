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
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-md hover:bg-gray-700 transition-colors">Login</Link>
              <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
