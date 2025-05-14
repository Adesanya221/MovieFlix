import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { getMovieRecommendations } from '../services/recommendationApi';

interface UseRecommendationsReturn {
  recommendations: Movie[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get movie recommendations based on a movie ID
 * @param movieId - ID of the movie to get recommendations for
 * @returns Object with recommendations, loading state, and error
 */
const useRecommendations = (movieId: number | string): UseRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getMovieRecommendations(movieId);
        
        if (isMounted) {
          setRecommendations(response.results);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        
        if (isMounted) {
          setError('Failed to fetch recommendations. Please try again later.');
          setLoading(false);
        }
      }
    };
    
    if (movieId) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [movieId]);
  
  return { recommendations, loading, error };
};

export default useRecommendations; 