import { useState, useEffect, useCallback, useRef } from 'react';
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

// Cache structure to store API responses
interface CacheEntry {
  data: MovieResponse;
  timestamp: number;
}

// Cache expiration time (10 minutes)
const CACHE_EXPIRY = 10 * 60 * 1000;

// Create a global cache object outside the hook to persist between renders
const apiCache: Record<string, CacheEntry> = {};

const useMovies = (): UseMoviesReturn => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Debounce handling
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Update debounced search query after 500ms of inactivity
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);
  
  // Cache key generator
  const getCacheKey = useCallback((query: string, page: number): string => {
    return `${query || 'trending'}_page${page}`;
  }, []);
  
  // Check if cache is valid
  const isCacheValid = useCallback((cacheEntry: CacheEntry): boolean => {
    return Date.now() - cacheEntry.timestamp < CACHE_EXPIRY;
  }, []);

  // Enhanced fetchMovies function with caching
  const fetchMovies = useCallback(async (query: string, page: number) => {
    setLoading(true);
    
    // Generate cache key
    const cacheKey = getCacheKey(query, page);
    
    // Check cache first
    if (apiCache[cacheKey] && isCacheValid(apiCache[cacheKey])) {
      console.log('🔄 Using cached data for:', cacheKey);
      const cachedData = apiCache[cacheKey].data;
      setMovies(cachedData.results);
      setTotalPages(cachedData.total_pages);
      setLoading(false);
      return;
    }
    
    setError(null);
    
    try {
      console.log('📡 Fetching fresh data for:', cacheKey);
      let response: MovieResponse;
      
      // Only make API calls if query or page has changed
      if (query.trim()) {
        response = await searchMoviesByTitle(query, page);
      } else {
        response = await getTrendingMovies(page);
      }
      
      // Optimize image enhancement to run in background without blocking UI
      setMovies(response.results);
      setTotalPages(response.total_pages);
      setLoading(false);
      
      // Cache the response
      apiCache[cacheKey] = {
        data: response,
        timestamp: Date.now()
      };
      
      // Enhance image quality in the background and update state when done
      enhanceMoviesWithBetterImages(response.results).then(enhancedMovies => {
        if (enhancedMovies.length > 0) {
          setMovies(enhancedMovies);
          
          // Update the cache with enhanced images
          apiCache[cacheKey] = {
            data: {
              ...response,
              results: enhancedMovies
            },
            timestamp: Date.now()
          };
        }
      });
      
    } catch (err) {
      // Try fallback APIs without blocking
      try {
        let fallbackResponse: MovieResponse;
        
        if (query.trim()) {
          fallbackResponse = await searchMovies(query, page);
        } else {
          fallbackResponse = await getPopularMovies(page);
        }
        
        setMovies(fallbackResponse.results);
        setTotalPages(fallbackResponse.total_pages);
        
        // Cache the fallback response
        apiCache[cacheKey] = {
          data: fallbackResponse,
          timestamp: Date.now()
        };
        
        // Enhance the fallback images in the background
        enhanceMoviesWithBetterImages(fallbackResponse.results).then(enhancedFallbackMovies => {
          if (enhancedFallbackMovies.length > 0) {
            setMovies(enhancedFallbackMovies);
            
            // Update the cache with enhanced images
            apiCache[cacheKey] = {
              data: {
                ...fallbackResponse,
                results: enhancedFallbackMovies
              },
              timestamp: Date.now()
            };
          }
        });
        
      } catch (fallbackErr) {
        setError('Failed to fetch movies. Please try again later.');
        console.error('Error in useMovies hook:', err, fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [getCacheKey, isCacheValid]);
  
  // Prefetch the next page in the background
  useEffect(() => {
    if (!loading && totalPages > currentPage) {
      const nextPage = currentPage + 1;
      const nextPageCacheKey = getCacheKey(debouncedSearchQuery, nextPage);
      
      // If we don't have the next page cached, fetch it in the background
      if (!apiCache[nextPageCacheKey] || !isCacheValid(apiCache[nextPageCacheKey])) {
        const prefetchNextPage = async () => {
          try {
            let nextPageResponse: MovieResponse;
            
            if (debouncedSearchQuery.trim()) {
              nextPageResponse = await searchMoviesByTitle(debouncedSearchQuery, nextPage);
            } else {
              nextPageResponse = await getTrendingMovies(nextPage);
            }
            
            // Cache the next page
            apiCache[nextPageCacheKey] = {
              data: nextPageResponse,
              timestamp: Date.now()
            };
            
            // Enhance images in the background
            enhanceMoviesWithBetterImages(nextPageResponse.results).then(enhancedMovies => {
              if (enhancedMovies.length > 0) {
                apiCache[nextPageCacheKey] = {
                  data: {
                    ...nextPageResponse,
                    results: enhancedMovies
                  },
                  timestamp: Date.now()
                };
              }
            });
          } catch (error) {
            // Silently fail on prefetch errors
            console.log('Background prefetch failed:', error);
          }
        };
        
        // Use requestIdleCallback if available, otherwise setTimeout
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => prefetchNextPage());
        } else {
          setTimeout(prefetchNextPage, 2000);
        }
      }
    }
  }, [loading, totalPages, currentPage, debouncedSearchQuery, getCacheKey, isCacheValid]);
  
  // Fetch movies when the debounced search query or page changes
  useEffect(() => {
    fetchMovies(debouncedSearchQuery, currentPage);
  }, [debouncedSearchQuery, currentPage, fetchMovies]);
  
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);
  
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