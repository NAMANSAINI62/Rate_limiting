import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white flex flex-col">
          <Navbar />
          
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={
                <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8">
                  <h1 className="text-3xl font-bold text-white mb-4">Rate Limiter Dashboard</h1>
                  <p className="text-gray-300">Welcome to the Rate Limiting Learning Project.</p>
                  <br/>
                  <p className="text-gray-400">
                    Phase 5 is complete. You can now Sign Up and Log In!
                  </p>
                </div>
              } />
              
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Catch-all redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
