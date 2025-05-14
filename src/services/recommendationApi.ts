import axios from 'axios';
import { MovieResponse } from '../types/movie';

// TMDB API for personalized recommendations
const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: '3e12a9908d2642bc0d6466c606f81731', // Demo API key for educational purposes
  },
  // Add request timeout to prevent hanging requests
  timeout: 5000
});

// Cache structure for recommendations
interface RecommendationCache {
  [key: string]: {
    data: MovieResponse;
    timestamp: number;
  }
}

// Cache expiration time (15 minutes)
const CACHE_EXPIRY = 15 * 60 * 1000;

// Global recommendations cache
const recommendationsCache: RecommendationCache = {};

/**
 * Get movie recommendations based on a movie ID
 * @param movieId - The ID of the movie to get recommendations for
 * @param page - The page number of results
 * @returns Promise with MovieResponse containing recommendations
 */
export const getMovieRecommendations = async (
  movieId: number | string,
  page: number = 1
): Promise<MovieResponse> => {
  try {
    // Generate cache key
    const cacheKey = `recommendations_${movieId}_page${page}`;
    
    // Check cache first
    if (recommendationsCache[cacheKey] && 
        (Date.now() - recommendationsCache[cacheKey].timestamp) < CACHE_EXPIRY) {
      console.log('Using cached recommendations for:', movieId);
      return recommendationsCache[cacheKey].data;
    }
    
    console.log(`Fetching recommendations for movie ID: ${movieId}`);
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`, {
      params: { page }
    });
    
    // Transform the results to match our Movie type
    const results = response.data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || '',
      poster_path: movie.poster_path ? 
        `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      backdrop_path: movie.backdrop_path ? 
        `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
      vote_count: movie.vote_count || 0,
      popularity: movie.popularity || 0,
      genre_ids: movie.genre_ids || []
    }));
    
    const movieResponse: MovieResponse = {
      page: response.data.page,
      results,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results
    };
    
    // Cache the result
    recommendationsCache[cacheKey] = {
      data: movieResponse,
      timestamp: Date.now()
    };
    
    return movieResponse;
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    // Return empty results on error
    return {
      page: page,
      results: [],
      total_pages: 0,
      total_results: 0
    };
  }
};

/**
 * Get user-personalized recommendations based on a list of movie IDs
 * @param movieIds - Array of movie IDs the user has watched or liked
 * @param page - The page number of results
 * @returns Promise with MovieResponse containing personalized recommendations
 */
export const getPersonalizedRecommendations = async (
  movieIds: (number | string)[],
  page: number = 1
): Promise<MovieResponse> => {
  try {
    // Use at most 3 most recent movies for recommendations
    const recentMovieIds = movieIds.slice(0, 3);
    
    // Generate cache key based on movie IDs
    const moviesKey = recentMovieIds.join('_');
    const cacheKey = `personalized_${moviesKey}_page${page}`;
    
    // Check cache first
    if (recommendationsCache[cacheKey] && 
        (Date.now() - recommendationsCache[cacheKey].timestamp) < CACHE_EXPIRY) {
      console.log('Using cached personalized recommendations');
      return recommendationsCache[cacheKey].data;
    }
    
    // Get recommendations for each movie and combine them
    const recommendationsPromises = recentMovieIds.map(id => 
      getMovieRecommendations(id)
    );
    
    const recommendationsResults = await Promise.all(recommendationsPromises);
    
    // Combine and deduplicate results
    const allMovies = recommendationsResults.flatMap(response => response.results);
    const uniqueMovies = allMovies.filter((movie, index, self) => 
      index === self.findIndex(m => m.id === movie.id)
    );
    
    // Sort by popularity for better results
    uniqueMovies.sort((a, b) => b.popularity - a.popularity);
    
    // Paginate results
    const startIndex = (page - 1) * 20;
    const paginatedMovies = uniqueMovies.slice(startIndex, startIndex + 20);
    
    const movieResponse: MovieResponse = {
      page,
      results: paginatedMovies,
      total_pages: Math.ceil(uniqueMovies.length / 20),
      total_results: uniqueMovies.length
    };
    
    // Cache the result
    recommendationsCache[cacheKey] = {
      data: movieResponse,
      timestamp: Date.now()
    };
    
    return movieResponse;
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    // Return empty results on error
    return {
      page,
      results: [],
      total_pages: 0,
      total_results: 0
    };
  }
};

// Export recommendationApi as a named export
const recommendationApi = {
  getMovieRecommendations,
  getPersonalizedRecommendations
};

export default recommendationApi; 