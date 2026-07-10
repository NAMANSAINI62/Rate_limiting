import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminRoute from './components/AdminRoute';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white flex flex-col">
        {user && <Navbar />}
        
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } />
            
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
            
            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            
            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
