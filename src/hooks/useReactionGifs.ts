import { useState, useEffect, useCallback } from 'react';
import { GifItem, getMovieReactionGifs, getTrendingGifs } from '../services/gifApi';

interface UseReactionGifsReturn {
  gifs: GifItem[];
  trendingGifs: GifItem[];
  loading: boolean;
  error: string | null;
  searchGifs: (emotion: string) => Promise<void>;
  refreshTrendingGifs: () => Promise<void>;
}

/**
 * Hook to get and search for reaction GIFs
 * @returns Object with GIFs, loading state, error, and search function
 */
const useReactionGifs = (): UseReactionGifsReturn => {
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [trendingGifs, setTrendingGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to search for GIFs by emotion
  const searchGifs = useCallback(async (emotion: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMovieReactionGifs(emotion);
      setGifs(response.gifs);
      setLoading(false);
    } catch (err) {
      console.error('Error searching reaction GIFs:', err);
      setError('Failed to fetch reaction GIFs. Please try again later.');
      setLoading(false);
    }
  }, []);
  
  // Function to refresh trending GIFs
  const refreshTrendingGifs = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await getTrendingGifs();
      setTrendingGifs(response.gifs);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trending GIFs:', err);
      // Don't set error for trending GIFs to avoid disrupting the UI
      setLoading(false);
    }
  }, []);
  
  // Load trending GIFs on mount
  useEffect(() => {
    refreshTrendingGifs();
  }, [refreshTrendingGifs]);
  
  return { 
    gifs, 
    trendingGifs,
    loading, 
    error, 
    searchGifs,
    refreshTrendingGifs
  };
};

export default useReactionGifs; 