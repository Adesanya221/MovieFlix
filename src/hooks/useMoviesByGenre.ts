import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { getMoviesByGenre } from '../services/streamingApi';
import { getPopularMovies } from '../services/movieApi';
import { enhanceMoviesWithBetterImages } from '../services/posterApi';

interface UseMoviesByGenreReturn {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  setPage: (page: number) => void;
}

const useMoviesByGenre = (genreId: number): UseMoviesByGenreReturn => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchMoviesByGenre = async () => {
      if (!genreId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Use the streaming API to get movies by genre
        const response = await getMoviesByGenre(genreId, currentPage);
        
        // Enhance movies with better quality images
        const enhancedMovies = await enhanceMoviesWithBetterImages(response.results);
        
        setMovies(enhancedMovies);
        setTotalPages(response.total_pages);
      } catch (err) {
        // Fallback to filtering popular movies if the genre API fails
        try {
          const fallbackResponse = await getPopularMovies(currentPage);
          const filteredMovies = fallbackResponse.results.filter(movie => 
            movie.genre_ids.includes(genreId)
          );
          
          // Enhance filtered movies with better images
          const enhancedFilteredMovies = await enhanceMoviesWithBetterImages(filteredMovies);
          
          setMovies(enhancedFilteredMovies);
          setTotalPages(fallbackResponse.total_pages);
        } catch (fallbackErr) {
          setError('Failed to fetch genre movies. Please try again later.');
          console.error(`Error fetching movies for genre ID ${genreId}:`, err, fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMoviesByGenre();
  }, [genreId, currentPage]);
  
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

export default useMoviesByGenre; 