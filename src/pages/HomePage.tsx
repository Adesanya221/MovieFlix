import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid';
import Pagination from '../components/Pagination';
import GenreList from '../components/GenreList';
import VideoSnippet from '../components/VideoSnippet';
import useMovies from '../hooks/useMovies';
import useMoviesByGenre from '../hooks/useMoviesByGenre';
import useNollywoodMovies from '../hooks/useNollywoodMovies';
import useMovieTrailer from '../hooks/useMovieTrailers';
import { extractYouTubeId, getYouTubeThumbnail } from '../services/youtubeTrailerService';
import { isUserLoggedIn, getUserInfo } from '../utils/authUtils';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    movies,
    loading,
    error,
    totalPages,
    currentPage,
    setPage,
  } = useMovies();

  // Login status for testing
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Check login status on component mount
  useEffect(() => {
    const loggedIn = isUserLoggedIn();
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      const userInfo = getUserInfo();
      if (userInfo && userInfo.email) {
        setUserEmail(userInfo.email);
      }
    }
  }, []);

  // Get Nollywood movies
  const {
    movies: nollywoodMovies,
    loading: nollywoodLoading,
    error: nollywoodError
  } = useNollywoodMovies();

  // Get action movies (genre 28)
  const {
    movies: actionMovies,
    loading: actionLoading
  } = useMoviesByGenre(28);

  // Get comedy movies (genre 35)
  const {
    movies: comedyMovies,
    loading: comedyLoading
  } = useMoviesByGenre(35);

  // Get sci-fi movies (genre 878)
  const {
    movies: scifiMovies,
    loading: scifiLoading
  } = useMoviesByGenre(878);

  const [featuredMovie, setFeaturedMovie] = useState<any>(null);
  const [isHeroLoading, setIsHeroLoading] = useState(true);

  // Get trailer for the featured movie
  const {
    trailer: featuredTrailer,
    loading: trailerLoading
  } = useMovieTrailer(
    featuredMovie?.title || '',
    featuredMovie?.release_date?.split('-')[0]
  );

  useEffect(() => {
    // Select a random movie as the featured one when movies are loaded
    if (movies.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(5, movies.length));
      setFeaturedMovie(movies[randomIndex]);
      setIsHeroLoading(false);
    }
  }, [movies]);

  const handleGenreSelect = (genreId: number) => {
    navigate(`/genre/${genreId}`);
  };

  // Format current month name
  const getCurrentMonthName = () => {
    return new Date().toLocaleString('default', { month: 'long' });
  };

  // Get trailers for a few Nollywood movies
  const [videoThumbnails, setVideoThumbnails] = useState<{
    videoId: string;
    thumbnailUrl: string;
    title: string;
  }[]>([]);

  // Process movie trailer thumbnails from existing data
  useEffect(() => {
    const processTrailers = () => {
      const thumbnails = [];
      const processedMovies = [...(nollywoodMovies || []), ...(actionMovies || [])];
      
      for (const movie of processedMovies) {
        if (movie.trailer_thumbnail) {
          // Extract video ID from trailer URL if available
          const videoId = extractYouTubeId(movie.trailer_thumbnail) || 
            // Create a videoId based on movie title if we can't extract it
            movie.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 11);
          
          if (videoId) {
            thumbnails.push({
              videoId,
              thumbnailUrl: movie.trailer_thumbnail || getYouTubeThumbnail(videoId),
              title: movie.title
            });
            
            if (thumbnails.length >= 4) break; // Limit to 4 trailers
          }
        }
      }
      
      setVideoThumbnails(thumbnails);
    };
    
    if (!nollywoodLoading && !actionLoading) {
      processTrailers();
    }
  }, [nollywoodMovies, actionMovies, nollywoodLoading, actionLoading]);

  return (
    <div className="pb-20 pt-16 bg-netflix-black">
      {/* Hero Section */}
      <section className="relative w-full">
        {isHeroLoading || !featuredMovie ? (
          // Loading state for hero
          <div className="h-[85vh] w-full bg-netflix-dark shimmer"></div>
        ) : (
          <>
            <div 
              className="h-[85vh] w-full bg-cover bg-center relative"
              style={{
                backgroundImage: `url(${featuredMovie.backdrop_path || featuredMovie.poster_path})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/70 to-transparent"></div>
              <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-netflix-black to-transparent"></div>
              
              <div className="absolute inset-0 flex items-center">
                <div className="w-full px-4 md:px-12 lg:px-24">
                  <div className="max-w-2xl space-y-6">
                    {/* Testing login status */}
                    {isLoggedIn && (
                      <div className="mb-4 p-3 bg-green-500/30 border border-green-500 text-white rounded-md">
                        <p>Logged in as: {userEmail}</p>
                      </div>
                    )}
                    <h1 className="text-4xl md:text-6xl font-bold text-white">{featuredMovie.title}</h1>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-500 font-semibold">{Math.round(featuredMovie.vote_average * 10)}% Match</span>
                      <span className="text-gray-400">{featuredMovie.release_date?.split('-')[0]}</span>
                    </div>
                    <p className="text-gray-300 text-base md:text-lg line-clamp-3 md:line-clamp-4">{featuredMovie.overview}</p>
                    <div className="flex space-x-4 pt-2">
                      <button 
                        onClick={() => navigate(`/movie/${featuredMovie.id}`)}
                        className="bg-netflix-red hover:bg-netflix-red/80 text-white px-8 py-3 rounded flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Play
                      </button>
                      {/* Login button for testing */}
                      {!isLoggedIn && (
                        <button 
                          onClick={() => navigate('/login')}
                          className="bg-netflix-red hover:bg-netflix-red/80 text-white px-8 py-3 rounded flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Sign In
                        </button>
                      )}
                      {featuredTrailer && !trailerLoading && (
                        <button 
                          onClick={() => window.open(`https://www.youtube.com/watch?v=${featuredTrailer.videoId}`, '_blank')}
                          className="bg-gray-700/80 hover:bg-gray-600 text-white px-8 py-3 rounded flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          Watch Trailer
                        </button>
                      )}
                      {!featuredTrailer && (
                        <button 
                          onClick={() => navigate(`/movie/${featuredMovie.id}`)}
                          className="bg-gray-700/80 hover:bg-gray-600 text-white px-8 py-3 rounded flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                          More Info
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Categories (mobile only) */}
      <div className="md:hidden mt-4 mb-2 px-4">
        <h2 className="text-xl font-medium text-white mb-4">Browse by</h2>
        <GenreList 
          onSelectGenre={handleGenreSelect} 
          layout="horizontal" 
        />
      </div>

      {/* Display error if present */}
      {error && (
        <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mx-4 md:mx-8 mt-6 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {/* Trailers Section */}
      {videoThumbnails.length > 0 && (
        <div className="my-12 px-4 md:px-8 lg:px-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-netflix-red mr-2">Latest</span> Trailers
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {videoThumbnails.map((item, index) => (
              <VideoSnippet
                key={item.videoId || index}
                videoId={item.videoId}
                thumbnailUrl={item.thumbnailUrl}
                title={item.title}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Nollywood Movies Section (Full Width) */}
      <div className="mt-12 mb-12 w-full">
        <div className="px-4 md:px-8 mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="text-netflix-red mr-2">New</span> Nollywood Movies • {getCurrentMonthName()}
            {nollywoodLoading && (
              <span className="ml-3 inline-block w-5 h-5 border-2 border-netflix-red border-t-transparent rounded-full animate-spin"></span>
            )}
          </h2>
        </div>
        
        {nollywoodError && (
          <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mx-4 md:mx-8 mb-8">
            <p className="text-red-400 text-sm">{nollywoodError}</p>
          </div>
        )}
        
        <div className="w-full">
          <MovieGrid 
            movies={nollywoodMovies} 
            loading={nollywoodLoading}
            title=""
          />
          
          {!nollywoodLoading && nollywoodMovies.length === 0 && (
            <div className="text-center py-12 px-4">
              <p className="text-gray-400 mb-2">No Nollywood movies found for this month.</p>
              <p className="text-gray-500 text-sm">Check back later for updates.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Movies by Genre Rows */}
      <div className="mt-2 space-y-8">
        <MovieGrid 
          movies={actionMovies} 
          loading={actionLoading}
          title="Action Movies" 
          isRow={true}
        />
        
        <MovieGrid 
          movies={comedyMovies} 
          loading={comedyLoading}
          title="Comedy Movies" 
          isRow={true}
        />
        
        <MovieGrid 
          movies={scifiMovies} 
          loading={scifiLoading}
          title="Science Fiction" 
          isRow={true}
        />
        
        <div className="mt-12">
          <MovieGrid 
            movies={movies} 
            loading={loading}
            title="Popular on MovieFlix" 
          />
          
          {!loading && movies.length > 0 && (
            <div className="px-4 md:px-8 mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 