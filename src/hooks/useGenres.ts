import { useState, useEffect } from 'react';
import { getGenres, Genre } from '../services/movieApi';

interface UseGenresReturn {
  genres: Genre[];
  loading: boolean;
  error: string | null;
}

const useGenres = (): UseGenresReturn => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getGenres();
        setGenres(data);
      } catch (err) {
        setError('Failed to fetch genres. Please try again later.');
        console.error('Error in useGenres hook:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGenres();
  }, []);
  
  return { genres, loading, error };
};

export default useGenres; 