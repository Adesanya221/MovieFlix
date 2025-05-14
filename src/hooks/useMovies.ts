import { useState, useEffect } from 'react';
import { Movie, MovieResponse } from '../types/movie';
import { getPopularMovies, searchMovies } from '../services/movieApi';
import { searchMoviesByTitle, getTrendingMovies } from '../services/streamingApi';
import { enhanceMoviesWithBetterImages } from '../services/posterApi';

interface UseMoviesReturn {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  setPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const useMovies = (): UseMoviesReturn => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let response: MovieResponse;
        
        if (searchQuery.trim()) {
          response = await searchMoviesByTitle(searchQuery, currentPage);
        } else {
          response = await getTrendingMovies(currentPage);
        }
        
        // Enhance movies with better quality images
        const enhancedMovies = await enhanceMoviesWithBetterImages(response.results);
        
        setMovies(enhancedMovies);
        setTotalPages(response.total_pages);
      } catch (err) {
        try {
          let fallbackResponse: MovieResponse;
          
          if (searchQuery.trim()) {
            fallbackResponse = await searchMovies(searchQuery, currentPage);
          } else {
            fallbackResponse = await getPopularMovies(currentPage);
          }
          
          // Enhance fallback movies with better quality images
          const enhancedFallbackMovies = await enhanceMoviesWithBetterImages(fallbackResponse.results);
          
          setMovies(enhancedFallbackMovies);
          setTotalPages(fallbackResponse.total_pages);
        } catch (fallbackErr) {
          setError('Failed to fetch movies. Please try again later.');
          console.error('Error in useMovies hook:', err, fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, [currentPage, searchQuery]);
  
  const setPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  return {
    movies,
    loading,
    error,
    totalPages,
    currentPage,
    setPage,
    searchQuery,
    setSearchQuery
  };
};

export default useMovies; 