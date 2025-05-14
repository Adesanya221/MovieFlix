import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useMovieDetails from '../hooks/useMovieDetails';
import useSimilarMovies from '../hooks/useSimilarMovies';
import useRecommendations from '../hooks/useRecommendations';
import useMovieTrivia from '../hooks/useMovieTrivia';
import useReactionGifs from '../hooks/useReactionGifs';
import MovieGrid from '../components/MovieGrid';

const MovieDetailPage: React.FC = () => {
  const { id = '0' } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'similar' | 'recommendations' | 'trivia'>('similar');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  
  // Handle different ID formats
  const getMovieId = (idParam: string): number => {
    // If it's a special format like 'nw_3', extract the number part
    if (idParam.includes('_')) {
      const parts = idParam.split('_');
      const numericPart = parts[parts.length - 1]; // Get the last part
      return parseInt(numericPart, 10) || 3; // Default to 3 if parsing fails
    }
    
    // For normal numeric IDs
    return parseInt(idParam, 10) || 1; // Default to 1 if parsing fails
  };
  
  const movieId = getMovieId(id);
  
  // Fetch movie data using our hooks
  const { movie, loading, error } = useMovieDetails(movieId);
  const { similarMovies, loading: similarLoading } = useSimilarMovies(movieId);
  const { recommendations, loading: recommendationsLoading } = useRecommendations(movieId);
  const { trivia, loading: triviaLoading } = useMovieTrivia(movieId);
  const { gifs, loading: gifsLoading, searchGifs } = useReactionGifs();
  
  // Predefined emotions for reaction GIFs
  const emotions = [
    'love it', 'hate it', 'wow', 'shocked', 'boring', 
    'awesome', 'laugh', 'cry', 'amazing', 'confused'
  ];
  
  // Handle emotion selection and GIF search
  const handleEmotionClick = (emotion: string) => {
    setSelectedEmotion(emotion);
    searchGifs(emotion);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black pt-20">
        <div className="h-[50vh] bg-netflix-dark shimmer"></div>
        <div className="netflix-container -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-64 h-96 bg-netflix-dark shimmer rounded-md"></div>
            <div className="flex-1 space-y-4">
              <div className="h-10 w-3/4 bg-netflix-dark shimmer rounded"></div>
              <div className="h-6 w-1/2 bg-netflix-dark shimmer rounded"></div>
              <div className="h-4 w-1/4 bg-netflix-dark shimmer rounded"></div>
              <div className="flex space-x-3">
                <div className="h-10 w-24 bg-netflix-dark shimmer rounded"></div>
                <div className="h-10 w-32 bg-netflix-dark shimmer rounded"></div>
              </div>
              <div className="h-32 w-full bg-netflix-dark shimmer rounded mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-netflix-black pt-32">
        <div className="netflix-container">
          <div className="max-w-lg mx-auto bg-netflix-dark p-8 rounded-lg text-center">
            <h2 className="text-2xl font-medium text-white mb-4">
              {error || 'Movie not found'}
            </h2>
            <p className="text-gray-400 mb-6">
              Sorry, we couldn't find the movie you're looking for.
            </p>
            <Link 
              to="/" 
              className="inline-block bg-netflix-red hover:bg-netflix-red/80 transition-colors text-white px-6 py-2 rounded"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const placeholderImage = 'https://via.placeholder.com/500x750?text=No+Image+Available';
  
  // Helper function to format image URLs correctly
  const formatImageUrl = (path: string | null | undefined, size: string = 'w500'): string | undefined => {
    if (!path) return undefined;
    
    if (path.startsWith('http')) {
      return path; // Already a full URL
    } else if (path.startsWith('/')) {
      return `https://image.tmdb.org/t/p/${size}${path}`;
    } else {
      return `https://image.tmdb.org/t/p/${size}/${path}`;
    }
  };
  
  const backdropImage = movie.backdrop_path 
    ? formatImageUrl(movie.backdrop_path, 'original')
    : undefined;
  const posterImage = movie.poster_path 
    ? formatImageUrl(movie.poster_path)
    : placeholderImage;

  // Format runtime to hours and minutes
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get a random quote from trivia if available
  const randomQuote = trivia.quotes.length > 0 
    ? trivia.quotes[Math.floor(Math.random() * trivia.quotes.length)]
    : null;

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Backdrop Image */}
      {backdropImage && (
        <div 
          className="h-[70vh] w-full bg-cover bg-center relative"
          style={{ 
            backgroundImage: `url(${backdropImage})`,
            backgroundSize: 'cover'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/60 to-transparent"></div>
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-netflix-black to-transparent"></div>
          
          {/* Random Quote Overlay */}
          {randomQuote && (
            <div className="absolute bottom-32 left-0 right-0 text-center px-4">
              <div className="inline-block max-w-2xl mx-auto bg-black/80 px-6 py-4 rounded-lg text-white italic text-lg">
                "{randomQuote}"
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Movie Content */}
      <div className={`netflix-container prevent-overflow ${backdropImage ? '-mt-64' : 'pt-32'} relative z-10`}>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Movie Poster */}
          <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
            <div className="rounded-md overflow-hidden shadow-lg">
              <img src={posterImage} alt={movie.title} className="w-full responsive-image" />
            </div>
            
            {/* Movie Facts and Trivia Button */}
            {trivia && (trivia.facts.length > 0 || trivia.didYouKnow.length > 0) && (
              <div className="mt-4">
                <button 
                  onClick={() => setActiveTab('trivia')}
                  className="w-full py-2 px-4 bg-netflix-dark hover:bg-netflix-red transition-colors text-white rounded flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Movie Facts
                </button>
              </div>
            )}
            
            {/* Watch Party Button */}
            <div className="mt-3">
              <Link 
                to={`/watch-party/${movieId}`}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 transition-colors text-white rounded flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Start Watch Party
              </Link>
            </div>
          </div>
          
          {/* Movie Info */}
          <div className="flex-1 p-3 md:p-0">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 prevent-overflow">{movie.title}</h1>
            
            {movie.tagline && (
              <p className="text-gray-300 text-base md:text-lg italic mb-4 prevent-overflow">{movie.tagline}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 md:mb-6">
              {movie.release_date && (
                <span className="text-gray-400 mobile-text-sm">{movie.release_date.split('-')[0]}</span>
              )}
              
              {movie.runtime > 0 && (
                <span className="text-gray-400 mobile-text-sm">{formatRuntime(movie.runtime)}</span>
              )}
              
              <span className="flex items-center">
                <span className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-netflix-dark text-green-500 font-bold">
                  {Math.round(movie.vote_average * 10)}
                </span>
                <span className="text-green-500 ml-1 text-sm">%</span>
              </span>
            </div>
            
            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
              {movie.genres.map(genre => (
                <Link 
                  key={genre.id} 
                  to={`/genre/${genre.id}`}
                  className="px-2 py-1 md:px-3 md:py-1 bg-netflix-dark rounded-full text-xs md:text-sm text-white hover:bg-netflix-red transition-colors duration-200"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 mb-4 md:mb-8">
              <button className="bg-netflix-red hover:bg-netflix-red/80 text-white px-4 py-2 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play
              </button>
              <button className="bg-gray-700/80 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="hidden sm:inline">Add to My List</span>
                <span className="inline sm:hidden">My List</span>
              </button>
            </div>
            
            {/* Overview */}
            <div className="mb-4 md:mb-8">
              <h3 className="text-lg md:text-xl font-medium text-white mb-2 md:mb-3">Overview</h3>
              <p className="text-gray-300 text-sm md:text-base prevent-overflow">{movie.overview}</p>
            </div>
            
            {/* Did You Know Section */}
            {trivia.didYouKnow.length > 0 && (
              <div className="mb-4 md:mb-8">
                <h3 className="text-lg md:text-xl font-medium text-white mb-2 md:mb-3">Did You Know?</h3>
                <div className="bg-netflix-dark/50 rounded-md p-3 md:p-4">
                  <p className="text-gray-300 text-sm md:text-base prevent-overflow">{trivia.didYouKnow[0]}</p>
                </div>
              </div>
            )}
            
            {/* Additional Info */}
            {(movie.budget > 0 || movie.revenue > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm p-4 bg-netflix-dark/50 rounded-md">
                {movie.budget > 0 && (
                  <div>
                    <span className="block text-gray-400">Budget</span>
                    <span className="text-white">${movie.budget.toLocaleString()}</span>
                  </div>
                )}
                
                {movie.revenue > 0 && (
                  <div>
                    <span className="block text-gray-400">Revenue</span>
                    <span className="text-white">${movie.revenue.toLocaleString()}</span>
                  </div>
                )}
                
                {movie.status && (
                  <div>
                    <span className="block text-gray-400">Status</span>
                    <span className="text-white">{movie.status}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Reaction GIFs Section */}
            <div className="mt-10">
              <h3 className="text-xl font-medium text-white mb-3">Your Reaction?</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {emotions.map(emotion => (
                  <button
                    key={emotion}
                    onClick={() => handleEmotionClick(emotion)}
                    className={`py-1 px-3 rounded-full text-sm ${
                      selectedEmotion === emotion 
                        ? 'bg-netflix-red text-white' 
                        : 'bg-netflix-dark text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
              
              {/* Display GIFs */}
              {selectedEmotion && (
                <div className="mt-3">
                  {gifsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-full h-28 bg-netflix-dark shimmer rounded"></div>
                      ))}
                    </div>
                  ) : gifs.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4">
                      {gifs.map(gif => (
                        <div key={gif.id} className="w-full h-auto">
                          <img 
                            src={gif.url} 
                            alt={gif.title}
                            className="rounded w-full object-cover"
                            style={{ maxHeight: '150px' }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No reaction GIFs found. Try another emotion!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabbed Content Section */}
      <div className="mt-16 pb-16 pt-8 border-t border-gray-800">
        <div className="netflix-container">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-800 mb-6">
            <button
              onClick={() => setActiveTab('similar')}
              className={`px-6 py-3 text-lg font-medium ${
                activeTab === 'similar' 
                  ? 'text-white border-b-2 border-netflix-red' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Similar Movies
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-6 py-3 text-lg font-medium ${
                activeTab === 'recommendations' 
                  ? 'text-white border-b-2 border-netflix-red' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Recommended For You
            </button>
            <button
              onClick={() => setActiveTab('trivia')}
              className={`px-6 py-3 text-lg font-medium ${
                activeTab === 'trivia' 
                  ? 'text-white border-b-2 border-netflix-red' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Trivia & Facts
            </button>
          </div>
          
          {/* Similar Movies Tab */}
          {activeTab === 'similar' && (
            <>
              <h2 className="text-2xl font-bold text-white mb-6 px-4 md:px-8 flex items-center">
                More Like This
                {similarMovies?.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">{similarMovies.length} titles</span>
                )}
              </h2>
              
              {similarMovies && similarMovies.length > 0 ? (
                <MovieGrid 
                  movies={similarMovies} 
                  loading={similarLoading} 
                  isRow={true}
                  explorePath={`/similar/${movieId}`}
                />
              ) : !similarLoading && (
                <div className="px-4 md:px-8 py-4">
                  <div className="bg-netflix-dark/50 rounded-md p-6 text-center">
                    <p className="text-gray-400">No similar movies found for this title.</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <>
              <h2 className="text-2xl font-bold text-white mb-6 px-4 md:px-8 flex items-center">
                Recommended For You
                {recommendations?.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">{recommendations.length} titles</span>
                )}
              </h2>
              
              {recommendations && recommendations.length > 0 ? (
                <MovieGrid 
                  movies={recommendations} 
                  loading={recommendationsLoading} 
                  isRow={true}
                />
              ) : !recommendationsLoading && (
                <div className="px-4 md:px-8 py-4">
                  <div className="bg-netflix-dark/50 rounded-md p-6 text-center">
                    <p className="text-gray-400">No personalized recommendations available for this title.</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Trivia Tab */}
          {activeTab === 'trivia' && (
            <div className="px-4 md:px-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Trivia & Facts for {movie.title}
              </h2>
              
              {triviaLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-full h-24 bg-netflix-dark shimmer rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Movie Facts */}
                  {trivia.facts.length > 0 && (
                    <div>
                      <h3 className="text-xl font-medium text-white mb-3">Interesting Facts</h3>
                      <div className="space-y-4">
                        {trivia.facts.map((fact, index) => (
                          <div key={index} className="bg-netflix-dark/50 rounded-md p-4">
                            <p className="text-gray-300">{fact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Movie Quotes */}
                  {trivia.quotes.length > 0 && (
                    <div>
                      <h3 className="text-xl font-medium text-white mb-3">Memorable Quotes</h3>
                      <div className="space-y-4">
                        {trivia.quotes.map((quote, index) => (
                          <div key={index} className="bg-netflix-dark/50 rounded-md p-4">
                            <p className="text-gray-300 italic">{quote}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Movie Goofs */}
                  {trivia.goofs.length > 0 && (
                    <div>
                      <h3 className="text-xl font-medium text-white mb-3">Goofs and Errors</h3>
                      <div className="space-y-4">
                        {trivia.goofs.map((goof, index) => (
                          <div key={index} className="bg-netflix-dark/50 rounded-md p-4">
                            <p className="text-gray-300">{goof}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Did You Know */}
                  {trivia.didYouKnow.length > 0 && (
                    <div>
                      <h3 className="text-xl font-medium text-white mb-3">Did You Know?</h3>
                      <div className="space-y-4">
                        {trivia.didYouKnow.map((fact, index) => (
                          <div key={index} className="bg-netflix-dark/50 rounded-md p-4">
                            <p className="text-gray-300">{fact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Awards */}
                  {trivia.awards.length > 0 && (
                    <div>
                      <h3 className="text-xl font-medium text-white mb-3">Awards</h3>
                      <div className="space-y-4">
                        {trivia.awards.map((award, index) => (
                          <div key={index} className="bg-netflix-dark/50 rounded-md p-4">
                            <p className="text-gray-300">{award}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* No trivia message */}
                  {trivia.facts.length === 0 && 
                   trivia.quotes.length === 0 && 
                   trivia.goofs.length === 0 && 
                   trivia.didYouKnow.length === 0 && 
                   trivia.awards.length === 0 && (
                    <div className="bg-netflix-dark/50 rounded-md p-6 text-center">
                      <p className="text-gray-400">No trivia or facts available for this movie.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Back Button */}
        <div className="netflix-container mt-12">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-400 hover:text-white ml-4 md:ml-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Browse
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage; 