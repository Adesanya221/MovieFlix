import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, isUserLoggedIn } from '../utils/authUtils';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (isUserLoggedIn()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    
    // Clear any previous error
    setErrorMessage('');
    
    // Simulate successful login
    try {
      loginUser(email);
      navigate('/');
    } catch (error) {
      setErrorMessage('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/a43711df-c428-4f88-8bb3-b2ac5f20608f/32935458-d049-44c2-b94b-32f16d60ded1/NG-en-20230227-popsignuptwoweeks-perspective_alpha_website_small.jpg')]">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      {/* Large background "MOVIEFLIX" text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="text-[15vw] font-extrabold text-white/10 select-none tracking-tighter rotate-[-5deg]">
          MOVIEFLIX
        </h1>
      </div>
      
      <div className="z-10 w-full max-w-md p-8 bg-black/75 rounded-md shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-6">Sign In</h1>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-netflix-red/20 border border-netflix-red text-white rounded-md">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-[#333] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-[#333] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full p-4 bg-netflix-red text-white rounded-md hover:bg-red-700 transition duration-300 font-medium"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-6 text-[#737373]">
          <p>
            New to MovieFlix?{' '}
            <Link to="/signup" className="text-white hover:underline">
              Sign up now
            </Link>
          </p>
        </div>
        
        <div className="mt-4 text-sm text-[#737373]">
          <p>
            This page is protected by Google reCAPTCHA to ensure you're not a bot.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 