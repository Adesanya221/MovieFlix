import React from 'react';
import { useNavigate } from 'react-router-dom';
import useGenres from '../hooks/useGenres';

const GenresPage: React.FC = () => {
  const { genres, loading, error } = useGenres();
  const navigate = useNavigate();

  return (
    <div className="pt-24 pb-20">
      <div className="netflix-container">
        <h1 className="text-3xl font-bold text-white mb-8">Categories</h1>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(15).fill(0).map((_, index) => (
              <div key={index} className="h-20 bg-netflix-dark shimmer rounded-md"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mb-8">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => navigate(`/genre/${genre.id}`)}
                className="group h-20 relative bg-netflix-dark rounded-md overflow-hidden transition-transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">{genre.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenresPage; 