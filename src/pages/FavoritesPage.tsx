import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../types/movie';
import MovieGrid from '../components/MovieGrid';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real application, favorites would be stored in localStorage or a database
    // For now, we'll use a placeholder that simulates loading favorites
    const timer = setTimeout(() => {
      setFavorites([]);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pt-24 pb-20">
      <div className="netflix-container">
        <h1 className="text-3xl font-bold text-white mb-8">My List</h1>
        
        {!loading && favorites.length === 0 ? (
          <div className="py-12 text-center">
            <div className="max-w-md mx-auto">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 mx-auto mb-4 text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
              <h3 className="text-xl text-white mb-3">Your list is empty</h3>
              <p className="text-gray-400 mb-6">
                Add movies and TV shows to your list to keep track of what you want to watch.
              </p>
              <Link 
                to="/" 
                className="inline-block bg-netflix-red hover:bg-netflix-red/80 transition-colors text-white px-6 py-2 rounded"
              >
                Browse Movies
              </Link>
            </div>
          </div>
        ) : (
          <MovieGrid movies={favorites} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default FavoritesPage; 