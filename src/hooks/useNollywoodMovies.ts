import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { getNollywoodMovies } from '../services/streamingApi';
import { enhanceMoviesWithBetterImages } from '../services/posterApi';

interface UseNollywoodMoviesReturn {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  setPage: (page: number) => void;
}

const useNollywoodMovies = (): UseNollywoodMoviesReturn => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchNollywoodMovies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getNollywoodMovies(currentPage);
        
        // Enhance movies with better quality images
        const enhancedMovies = await enhanceMoviesWithBetterImages(response.results);
        
        setMovies(enhancedMovies);
        setTotalPages(response.total_pages);
      } catch (err) {
        setError('Failed to fetch Nollywood movies. Please try again later.');
        console.error('Error in useNollywoodMovies hook:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNollywoodMovies();
  }, [currentPage]);
  
  const setPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };
  
  return {
    movies,
    loading,
    error,
    totalPages,
    currentPage,
    setPage
  };
};

export default useNollywoodMovies; 