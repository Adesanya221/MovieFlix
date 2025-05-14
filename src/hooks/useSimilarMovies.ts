import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { getSimilarMovies } from '../services/movieApi';

interface UseSimilarMoviesReturn {
  similarMovies: Movie[];
  loading: boolean;
  error: string | null;
}

const useSimilarMovies = (movieId: number): UseSimilarMoviesReturn => {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (!movieId) {
        console.log("No movieId provided for similar movies, skipping fetch");
        return;
      }
      
      console.log(`Fetching similar movies for ID: ${movieId}`);
      setLoading(true);
      setError(null);
      
      try {
        const response = await getSimilarMovies(movieId);
        console.log(`Fetched ${response.results.length} similar movies for ID ${movieId}`);
        setSimilarMovies(response.results);
      } catch (err) {
        setError('Failed to fetch similar movies.');
        console.error(`Error fetching similar movies for movie ID ${movieId}:`, err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSimilarMovies();
  }, [movieId]);
  
  return { similarMovies, loading, error };
};

export default useSimilarMovies; 