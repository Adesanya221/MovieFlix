import React, { useState, useEffect, useCallback } from 'react';
import { Movie } from '../types/movie';
import { Link } from 'react-router-dom';

interface MovieCardProps {
  movie: Movie & { trailer_thumbnail?: string };
  index?: number; // Position in the row for staggered animation
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const placeholderImage = 'https://via.placeholder.com/300x450/141414/E50914?text=Loading...';
  
  // Determine which image to use, with fallbacks
  const determineImageUrl = useCallback(() => {
    // If we've already successfully loaded an image, use that
    if (loadedImage) return loadedImage;
    
    // Check if poster path is a full URL or a path fragment
    if (movie.poster_path) {
      if (movie.poster_path.startsWith('http')) {
        return movie.poster_path;
      } else if (movie.poster_path.startsWith('/mock-')) {
        // For mock data, use a placeholder with the movie title
        return `https://via.placeholder.com/500x750/141414/E50914?text=${encodeURIComponent(movie.title)}`;
      } else if (movie.poster_path.startsWith('/')) {
        // TMDB path format
        return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      } else {
        // Assume it's a TMDB path without the leading slash
        return `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
      }
    }
    
    // If no poster_path or it failed, try trailer thumbnail
    if (movie.trailer_thumbnail) {
      return movie.trailer_thumbnail;
    }
    
    // If no trailer thumbnail or it failed, try backdrop
    if (movie.backdrop_path) {
      if (movie.backdrop_path.startsWith('http')) {
        return movie.backdrop_path;
      } else if (movie.backdrop_path.startsWith('/mock-')) {
        // For mock data, use a different colored placeholder
        return `https://via.placeholder.com/500x750/0F1729/E50914?text=${encodeURIComponent(movie.title)}`;
      } else {
        return `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;
      }
    }
    
    // Last resort: placeholder
    return placeholderImage;
  }, [movie.poster_path, movie.backdrop_path, movie.trailer_thumbnail, movie.title, loadedImage, placeholderImage]);
  
  // Initial image URL
  const [currentImageUrl, setCurrentImageUrl] = useState(determineImageUrl());
  
  // When image sources change, update the current image URL
  useEffect(() => {
    if (!loadedImage) {
      setCurrentImageUrl(determineImageUrl());
    }
  }, [loadedImage, determineImageUrl]);
  
  // Truncate long movie titles
  const truncateTitle = (title: string) => {
    return title.length > 20 ? title.substring(0, 20) + '...' : title;
  };

  // Calculate match percentage (Netflix style)
  const matchPercentage = Math.round(movie.vote_average * 10);
  
  // Animation delay based on index
  const animationDelay = `${index * 50}ms`;
  
  // Handle image loading error
  const handleImageError = () => {
    console.log(`Image error for ${movie.title}: ${currentImageUrl}`);
    
    // Try the next image in the cascade
    if (currentImageUrl.includes(movie.poster_path || '')) {
      // Poster failed, try trailer thumbnail
      if (movie.trailer_thumbnail) {
        setCurrentImageUrl(movie.trailer_thumbnail);
      } else if (movie.backdrop_path) {
        // No trailer thumbnail, try backdrop
        if (movie.backdrop_path.startsWith('http')) {
          setCurrentImageUrl(movie.backdrop_path);
        } else {
          setCurrentImageUrl(`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`);
        }
      } else {
        // Everything failed, use placeholder
        setCurrentImageUrl(placeholderImage);
      }
    } else if (currentImageUrl === movie.trailer_thumbnail) {
      // Trailer thumbnail failed, try backdrop
      if (movie.backdrop_path) {
        if (movie.backdrop_path.startsWith('http')) {
          setCurrentImageUrl(movie.backdrop_path);
        } else {
          setCurrentImageUrl(`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`);
        }
      } else {
        // No backdrop, use placeholder
        setCurrentImageUrl(placeholderImage);
      }
    } else {
      // Everything else failed, use placeholder
      setCurrentImageUrl(placeholderImage);
    }
  };
  
  // Handle successful image load
  const handleImageLoad = () => {
    setLoadedImage(currentImageUrl);
  };
  
  // Determine if current image is a YouTube thumbnail
  const isYouTubeThumbnail = movie.trailer_thumbnail && currentImageUrl === movie.trailer_thumbnail;
  
  return (
    <div 
      className="movie-card-container group relative flex flex-col movie-card-hover-effect"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        animationDelay,
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="movie-card relative rounded-md overflow-hidden shadow-lg">
          {/* Tag for new content - Netflix style */}
          {movie.release_date && new Date(movie.release_date) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) && (
            <div className="absolute top-0 left-0 bg-netflix-red text-white text-xs font-bold py-1 px-2 z-10">
              NEW
            </div>
          )}
          
          {/* YouTube thumbnail indicator */}
          {isYouTubeThumbnail && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold py-1 px-2 rounded-full z-10 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Trailer
            </div>
          )}
          
          <div className="aspect-[2/3] relative overflow-hidden netflix-card-shadow">
            {/* Background shimmer for loading state */}
            <div className="absolute inset-0 bg-netflix-dark shimmer"></div>
            
            <img 
              src={currentImageUrl}
              alt={movie.title} 
              className="w-full h-full object-cover transition-all duration-500 ease-in-out absolute inset-0 z-[1]"
              loading="lazy"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{
                opacity: loadedImage ? 1 : 0.8, // Fade in when loaded
                transform: `scale(${isHovered ? 1.05 : 1})`, // Slight zoom on hover
              }}
            />
            
            {/* Dark overlay */}
            <div 
              className={`absolute inset-0 z-[2] hover-overlay transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            ></div>
            
            {/* Play button overlay */}
            <div 
              className={`absolute inset-0 z-[3] flex items-center justify-center transition-all duration-300 ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
            >
              <div className="h-14 w-14 rounded-full border-2 border-white flex items-center justify-center bg-black/40">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Expanded info card - Netflix style */}
          <div 
            className={`movie-details absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent transition-all duration-300 z-[4] ${
              isHovered ? 'opacity-100 pb-6' : 'opacity-0 pb-2'
            }`}
          >
            <h3 className="text-white text-base font-medium truncate">{truncateTitle(movie.title)}</h3>
            
            <div className={`mt-2 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center space-x-2">
                <span className={`text-${matchPercentage >= 70 ? 'green' : 'gray'}-500 font-semibold text-sm`}>
                  {matchPercentage}% Match
                </span>
                <span className="text-gray-400 text-xs border border-gray-600 px-1">
                  {movie.release_date?.split('-')[0] || 'N/A'}
                </span>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <button className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Title displayed below the movie card - with red background */}
      <div className="mt-2 text-center">
        <h3 className="text-white text-sm font-medium truncate px-2 py-1 mx-auto inline-block bg-netflix-red rounded">{movie.title}</h3>
        <div className="text-xs text-gray-400 mt-1">
          {movie.release_date && movie.release_date.split('-')[0]}
        </div>
      </div>
    </div>
  );
};

export default MovieCard; 