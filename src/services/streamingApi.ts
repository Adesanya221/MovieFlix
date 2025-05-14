import axios from 'axios';
import { MovieResponse, Movie } from '../types/movie';
import { mockMovies } from './mockData';

// Create API instance with RapidAPI headers
const streamingApi = axios.create({
  baseURL: 'https://streaming-availability.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': '6325b160bcmsh9543ea6e247cb1bp1ea9dejsn2f2866249046',
    'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
  },
  // Add timeout to prevent hanging requests
  timeout: 8000
});

// Cache structure for API responses
interface ApiCache {
  [key: string]: {
    data: MovieResponse;
    timestamp: number;
  }
}

// Cache expiration time (15 minutes)
const CACHE_EXPIRY = 15 * 60 * 1000;

// Global API cache
const apiCache: ApiCache = {};

// Function to ensure URLs are absolute
const ensureAbsoluteUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // If already absolute, return as is
  if (url.startsWith('http')) return url;
  
  // If it's a TMDB path, add the domain
  if (url.startsWith('/')) {
    return `https://image.tmdb.org/t/p/original${url}`;
  }
  
  // Default to TMDB w500 image
  return `https://image.tmdb.org/t/p/w500${url}`;
};

// Helper function to transform API response to our movie format
const transformApiResponseToMovies = (apiResponse: any): Movie[] => {
  if (!apiResponse || !apiResponse.result || !Array.isArray(apiResponse.result)) {
    return [];
  }
  
  return apiResponse.result.map((item: any) => ({
    id: item.tmdbID || item.imdbID,
    title: item.title,
    overview: item.overview || '',
    poster_path: ensureAbsoluteUrl(item.posterURLs?.original || item.posterURLs?.['500'] || ''),
    backdrop_path: ensureAbsoluteUrl(item.backdropURLs?.original || item.backdropURLs?.['1280'] || ''),
    release_date: item.year ? `${item.year}-01-01` : '',
    vote_average: item.tmdbRating / 10 || 0, // API returns ratings out of 100
    vote_count: item.tmdbVotes || 0,
    popularity: item.popularity || 0,
    genre_ids: item.genres?.map((g: any) => g.id) || []
  }));
};

// Function to fetch movies by title search
export const searchMoviesByTitle = async (
  title: string = '',
  page: number = 1
): Promise<MovieResponse> => {
  try {
    // Generate cache key
    const cacheKey = `search_${title.toLowerCase()}_page${page}`;
    
    // Check cache first
    if (apiCache[cacheKey] && 
        (Date.now() - apiCache[cacheKey].timestamp) < CACHE_EXPIRY) {
      console.log('Using cached search data for:', title);
      return apiCache[cacheKey].data;
    }
    
    const params = new URLSearchParams({
      series_granularity: 'show',
      show_type: 'movie',
      output_language: 'en',
      title: title,
      page: page.toString(),
      limit: '20' // Default to 20 results per page
    });

    console.log('Searching movies by title:', title, 'Page:', page);
    const response = await streamingApi.get(`/shows/search/title?${params}`);
    
    console.log('API Response for search:', response.data);
    
    // Transform the API response to match our MovieResponse format
    const transformedMovies = transformApiResponseToMovies(response.data);
    console.log('Transformed movies:', transformedMovies.length, 'movies found');

    const result = {
      page: page,
      results: transformedMovies,
      total_pages: Math.ceil(response.data.total_pages || 1),
      total_results: response.data.total_results || transformedMovies.length
    };
    
    // Cache the result
    apiCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error('Error searching movies by title:', error);
    console.log('Returning mock data as fallback');
    
    // Filter mock data based on title if provided
    let filteredMockMovies = [...mockMovies];
    if (title) {
      filteredMockMovies = mockMovies.filter((movie: Movie) => 
        movie.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    
    // Return mock data on error
    return {
      page: page,
      results: filteredMockMovies,
      total_pages: 1,
      total_results: filteredMockMovies.length
    };
  }
};

// Function to get trending/popular movies
export const getTrendingMovies = async (page: number = 1): Promise<MovieResponse> => {
  try {
    // Generate cache key
    const cacheKey = `trending_page${page}`;
    
    // Check cache first
    if (apiCache[cacheKey] && 
        (Date.now() - apiCache[cacheKey].timestamp) < CACHE_EXPIRY) {
      console.log('Using cached trending data for page:', page);
      return apiCache[cacheKey].data;
    }
    
    console.log('Fetching trending movies, page:', page);
    // Use a specific trending endpoint or parameters if available
    const params = new URLSearchParams({
      series_granularity: 'show',
      show_type: 'movie',
      output_language: 'en',
      order_by: 'popularity',
      page: page.toString(),
      limit: '20'
    });

    const response = await streamingApi.get(`/shows/search/basic?${params}`);
    console.log('Trending API response:', response.data);
    
    // Transform the API response to match our MovieResponse format
    const transformedMovies = transformApiResponseToMovies(response.data);
    console.log('Trending movies transformed:', transformedMovies.length, 'movies');
    
    const result = {
      page: page,
      results: transformedMovies,
      total_pages: Math.ceil(response.data.total_pages || 1),
      total_results: response.data.total_results || transformedMovies.length
    };
    
    // Cache the result
    apiCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    console.log('Returning mock data as fallback');
    
    // Return mock data on error
    return {
      page: page,
      results: mockMovies,
      total_pages: 1,
      total_results: mockMovies.length
    };
  }
};

// Function to get movies by genre
export const getMoviesByGenre = async (
  genreId: number,
  page: number = 1
): Promise<MovieResponse> => {
  try {
    // Generate cache key
    const cacheKey = `genre_${genreId}_page${page}`;
    
    // Check cache first
    if (apiCache[cacheKey] && 
        (Date.now() - apiCache[cacheKey].timestamp) < CACHE_EXPIRY) {
      console.log('Using cached genre data for:', genreId, 'page:', page);
      return apiCache[cacheKey].data;
    }
    
    console.log(`Fetching movies for genre ${genreId}, page: ${page}`);
    const params = new URLSearchParams({
      series_granularity: 'show',
      show_type: 'movie',
      output_language: 'en',
      genres: genreId.toString(),
      page: page.toString(),
      limit: '20'
    });

    const response = await streamingApi.get(`/shows/search/basic?${params}`);
    console.log(`Genre ${genreId} API response:`, response.data);
    
    // Transform the API response to match our MovieResponse format
    const transformedMovies = transformApiResponseToMovies(response.data);
    console.log(`Genre ${genreId} transformed movies:`, transformedMovies.length, 'movies found');

    const result = {
      page: page,
      results: transformedMovies,
      total_pages: Math.ceil(response.data.total_pages || 1),
      total_results: response.data.total_results || transformedMovies.length
    };
    
    // Cache the result
    apiCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error(`Error fetching movies for genre ID ${genreId}:`, error);
    console.log('Returning filtered mock data as fallback');
    
    // Filter mock movies by genre
    const filteredMovies = mockMovies.filter((movie: Movie) => movie.genre_ids.includes(genreId));
    
    // Return filtered mock data on error
    return {
      page: page,
      results: filteredMovies,
      total_pages: 1,
      total_results: filteredMovies.length
    };
  }
};

// Get Nollywood movies (Nigerian cinema)
export const getNollywoodMovies = async (page: number = 1): Promise<MovieResponse> => {
  try {
    // Generate cache key
    const cacheKey = `nollywood_page${page}`;
    
    // Check cache first
    if (apiCache[cacheKey] && 
        (Date.now() - apiCache[cacheKey].timestamp) < CACHE_EXPIRY) {
      console.log('Using cached Nollywood data for page:', page);
      return apiCache[cacheKey].data;
    }
    
    console.log('Fetching Nollywood movies, page:', page);
    // Current date for filtering recent movies
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Use basic search with parameters to find Nigerian movies
    const params = new URLSearchParams({
      series_granularity: 'show',
      show_type: 'movie',
      output_language: 'en',
      country: 'ng', // Nigeria country code
      page: page.toString(),
      limit: '20',
      sort_by: 'year'
    });

    const response = await streamingApi.get(`/shows/search/basic?${params}`);
    console.log('Nollywood API response:', response.data);
    
    // Transform the API response to match our MovieResponse format
    const transformedMovies: Movie[] = response.data.result
      .filter((item: any) => {
        // Filter to only include movies from the current month/year or very recent
        const releaseDate = item.year ? new Date(item.year, 0) : null;
        return releaseDate && 
               ((releaseDate.getFullYear() === currentYear && 
                 releaseDate.getMonth() + 1 >= currentMonth - 1));
      })
      .map((item: any) => ({
        id: item.tmdbID || item.imdbID,
        title: item.title,
        overview: item.overview || 'No overview available for this Nollywood movie.',
        poster_path: ensureAbsoluteUrl(item.posterURLs?.original || item.posterURLs?.['500'] || ''),
        backdrop_path: ensureAbsoluteUrl(item.backdropURLs?.original || item.backdropURLs?.['1280'] || ''),
        release_date: item.year ? `${item.year}-01-01` : '',
        vote_average: item.tmdbRating / 10 || 0,
        vote_count: item.tmdbVotes || 0,
        popularity: item.popularity || 0,
        genre_ids: item.genres?.map((g: any) => g.id) || []
      }));

    console.log('Nollywood transformed movies:', transformedMovies.length, 'movies found');

    const result = {
      page: page,
      results: transformedMovies,
      total_pages: Math.ceil(response.data.total_pages || 1),
      total_results: response.data.total_results || transformedMovies.length
    };
    
    // Cache the result
    apiCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error('Error fetching Nollywood movies:', error);
    console.log('Returning mock Nollywood data as fallback');
    
    // Create a subset of mock movies as Nollywood movies
    const mockNollywoodMovies = mockMovies.slice(0, 8).map((movie: Movie) => ({
      ...movie,
      title: `Nollywood: ${movie.title}`,
      id: `nw_${movie.id}`
    }));
    
    // Return mock Nollywood data on error
    return {
      page: page,
      results: mockNollywoodMovies,
      total_pages: 1,
      total_results: mockNollywoodMovies.length
    };
  }
}; 