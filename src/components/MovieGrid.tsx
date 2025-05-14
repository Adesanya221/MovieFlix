import React, { useRef } from 'react';
import { Movie } from '../types/movie';
import MovieCard from './MovieCard';
import { Link } from 'react-router-dom';

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  title?: string;
  isRow?: boolean; // If true, display as a horizontal scrollable row (Netflix style)
  explorePath?: string; // Path to navigate to when clicking "Explore All"
}

const MovieGrid: React.FC<MovieGridProps> = ({ 
  movies, 
  loading, 
  title,
  isRow = false,
  explorePath
}) => {
  // Reference to the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll functions for the buttons
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75; // Scroll 75% of the visible width
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75; // Scroll 75% of the visible width
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="py-4 w-full">
        {title && (
          <h2 className="text-xl font-medium text-white mb-4 px-4 md:px-8">{title}</h2>
        )}
        <div className={
          isRow 
            ? "flex space-x-4 overflow-x-auto pb-8 px-4 md:px-8 hide-scrollbar"
            : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 px-4 md:px-8"
        }>
          {Array(isRow ? 8 : 12).fill(0).map((_, index) => (
            <div 
              key={index} 
              className={`
                ${isRow ? 'flex-shrink-0 w-[180px]' : ''}
                aspect-[2/3] rounded-md overflow-hidden shimmer
              `}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="py-8 text-center w-full">
        <p className="text-gray-400 text-lg">No movies found. Try a different search.</p>
      </div>
    );
  }

  return (
    <div className="movie-grid-section py-4 w-full">
      {title && (
        <div className="flex items-center justify-between mb-4 px-4 md:px-8 group">
          <h2 className="text-xl font-medium text-white group-hover:text-netflix-red transition-colors">{title}</h2>
          
          {isRow && explorePath && (
            <Link to={explorePath} className="text-sm text-gray-400 hover:text-white flex items-center">
              Explore All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>
      )}
      
      <div 
        ref={scrollContainerRef}
        className={`
          ${isRow 
            ? "flex space-x-6 overflow-x-auto pb-8 px-4 md:px-8 hide-scrollbar netflix-scroll-row group" 
            : "netflix-card-grid px-4 md:px-8"
          }
          ${isRow ? 'relative' : ''}
        `}
      >
        {/* Left scroll button (Netflix style) */}
        {isRow && movies.length > 6 && (
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-[80%] bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Movie cards */}
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className={`
              ${isRow ? 'flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]' : ''}
              transform transition-transform duration-300 hover:scale-105 hover:z-20
            `}
            style={{
              // Add a slight perspective effect for 3D-like hover
              perspective: '1000px',
              transformStyle: 'preserve-3d',
            }}
          >
            <MovieCard movie={movie} index={index} />
          </div>
        ))}
        
        {/* Right scroll button (Netflix style) */}
        {isRow && movies.length > 6 && (
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-[80%] bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieGrid; 