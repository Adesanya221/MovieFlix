import { useState, useEffect } from 'react';
import { fetchMovieTrailer, TrailerInfo } from '../services/youtubeTrailerService';

interface UseMovieTrailersReturn {
  trailer: TrailerInfo | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch a movie trailer
 * @param movieTitle Movie title
 * @param year Release year (optional)
 */
const useMovieTrailer = (
  movieTitle: string,
  year?: string | number
): UseMovieTrailersReturn => {
  const [trailer, setTrailer] = useState<TrailerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTrailer = async () => {
      if (!movieTitle) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const trailerInfo = await fetchMovieTrailer(movieTitle, year);
        setTrailer(trailerInfo);
      } catch (err) {
        console.error('Error fetching trailer:', err);
        setError('Failed to load trailer');
      } finally {
        setLoading(false);
      }
    };
    
    getTrailer();
  }, [movieTitle, year]);
  
  return {
    trailer,
    loading,
    error
  };
};

export default useMovieTrailer; 