import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../services/api';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/signup', { username, email, password });
      // On success, redirect to login page
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-gray-200 border border-gray-200 rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-4">
            <UserPlus className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-4xl font-bold text-black">Create Account</h2>
          <p className="text-gray-400 mt-2">Join the Rate Limiting Project</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Name"
              className="w-full px-4 py-2 border border-black-00 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email address"
              className="w-full px-4 py-2 border border-black-00 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Min 8 characters"
              className="w-full px-4 py-2 border border-black rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              required 
              minLength={8}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
