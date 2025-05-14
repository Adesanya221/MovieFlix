import { useState, useEffect } from 'react';
import { MovieTrivia, getMovieTriviaByTmdbId } from '../services/triviaApi';

interface UseMovieTriviaReturn {
  trivia: MovieTrivia;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get movie trivia based on a TMDB movie ID
 * @param movieId - TMDB ID of the movie
 * @returns Object with trivia, loading state, and error
 */
const useMovieTrivia = (movieId: number | string): UseMovieTriviaReturn => {
  const [trivia, setTrivia] = useState<MovieTrivia>({
    facts: [],
    goofs: [],
    quotes: [],
    didYouKnow: [],
    taglines: [],
    awards: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchTrivia = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getMovieTriviaByTmdbId(movieId);
        
        if (isMounted) {
          setTrivia(response);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching movie trivia:', err);
        
        if (isMounted) {
          setError('Failed to fetch movie trivia. Please try again later.');
          setLoading(false);
        }
      }
    };
    
    if (movieId) {
      fetchTrivia();
    } else {
      setTrivia({
        facts: [],
        goofs: [],
        quotes: [],
        didYouKnow: [],
        taglines: [],
        awards: []
      });
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [movieId]);
  
  return { trivia, loading, error };
};

export default useMovieTrivia; 