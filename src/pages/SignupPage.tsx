import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser, isUserLoggedIn } from '../utils/authUtils';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (!email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    
    // Clear any previous error
    setErrorMessage('');
    
    // Simulate successful signup
    try {
      signupUser(email);
      navigate('/');
    } catch (error) {
      setErrorMessage('An error occurred during sign up');
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
        <h1 className="text-3xl font-bold text-white mb-6">Sign Up</h1>
        
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
          
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 bg-[#333] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full p-4 bg-netflix-red text-white rounded-md hover:bg-red-700 transition duration-300 font-medium"
          >
            Sign Up
          </button>
        </form>
        
        <div className="mt-6 text-[#737373]">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:underline">
              Sign in now
            </Link>
          </p>
        </div>
        
        <div className="mt-4 text-sm text-[#737373]">
          <p>
            By signing up, you agree to our Terms of Use and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 