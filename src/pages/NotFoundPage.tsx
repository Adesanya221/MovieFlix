import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-netflix-black pt-32 pb-20">
      <div className="netflix-container">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-netflix-red text-7xl font-bold mb-4">404</h1>
          <h2 className="text-white text-3xl font-medium mb-6">Lost Your Way?</h2>
          <p className="text-gray-300 mb-8">
            Sorry, we can't find the page you're looking for. You'll find loads of movies to explore on our home page.
          </p>
          <Link 
            to="/" 
            className="inline-block bg-netflix-red hover:bg-netflix-red/80 transition-colors text-white px-8 py-3 rounded font-medium"
          >
            MovieFlix Home
          </Link>
          
          <div className="mt-12 text-gray-500 text-sm">
            Error Code: NSES-404
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 