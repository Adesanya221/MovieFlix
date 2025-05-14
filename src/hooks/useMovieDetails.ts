import { useState, useEffect } from 'react';
import { MovieDetails } from '../types/movie';
import { getMovieDetails } from '../services/movieApi';

interface UseMovieDetailsReturn {
  movie: MovieDetails | null;
  loading: boolean;
  error: string | null;
}

const useMovieDetails = (movieId: number): UseMovieDetailsReturn => {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) {
        console.log("No movieId provided, skipping fetch");
        return;
      }
      
      console.log(`Fetching movie details for ID: ${movieId}`);
      setLoading(true);
      setError(null);
      
      try {
        const response = await getMovieDetails(movieId);
        console.log("Movie details fetched successfully:", response);
        setMovie(response);
      } catch (err) {
        console.error(`Error fetching details for movie ID ${movieId}:`, err);
        setError('Failed to fetch movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieDetails();
  }, [movieId]);
  
  return { movie, loading, error };
};

export default useMovieDetails; 