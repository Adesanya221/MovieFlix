import axios from 'axios';

// TMDB API for high-quality movie posters and backdrops
const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: '3e12a9908d2642bc0d6466c606f81731', // Demo API key for educational purposes
  },
  // Add request timeout to prevent hanging requests
  timeout: 5000
});

// OMDb API as a fallback for posters
const omdbApi = axios.create({
  baseURL: 'https://www.omdbapi.com',
  params: {
    apikey: '7be28dba', // Demo API key for educational purposes
  },
  // Add request timeout to prevent hanging requests
  timeout: 5000
});

// YouTube API for trailers and thumbnails
const youtubeApi = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
  params: {
    key: 'AIzaSyDVGG7OZPN5Hw9oQ1QSfTiJN7h4K3ihJpw', // Demo API key for educational purposes
    part: 'snippet',
    maxResults: 1,
    type: 'video'
  },
  // Add request timeout to prevent hanging requests
  timeout: 5000
});

// Create a poster cache to avoid redundant API calls
interface PosterCache {
  [key: string]: {
    data: PosterResult;
    timestamp: number;
  }
}

interface PosterResult {
  posterUrl: string | null;
  backdropUrl: string | null;
  thumbnailUrl: string | null;
}

// Cache expiration time (30 minutes)
const POSTER_CACHE_EXPIRY = 30 * 60 * 1000;

// Global poster cache
const posterCache: PosterCache = {};

// Check if a valid poster URL already exists
const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  // Check if it's a valid-looking URL
  if (url.startsWith('http') && 
      (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg') || 
       url.includes('image.tmdb.org') || url.includes('m.media-amazon.com'))) {
    return true;
  }
  
  return false;
};

/**
 * Get high-quality poster, backdrop, and thumbnail for a movie
 * @param title Movie title
 * @param year Release year (optional)
 * @param imdbId IMDB ID (optional)
 * @param tmdbId TMDB ID (optional)
 */
export const getPosterImages = async (
  title: string,
  year?: string | number,
  imdbId?: string,
  tmdbId?: number
): Promise<PosterResult> => {
  try {
    // Generate a cache key based on available identifiers
    const cacheKey = tmdbId ? `tmdb_${tmdbId}` : 
                    imdbId ? `imdb_${imdbId}` : 
                    `${title}_${year || ''}`;
    
    // Check if we have a valid cached result
    if (posterCache[cacheKey] && 
        (Date.now() - posterCache[cacheKey].timestamp) < POSTER_CACHE_EXPIRY) {
      console.log('Using cached poster data for:', title);
      return posterCache[cacheKey].data;
    }
    
    let posterUrl: string | null = null;
    let backdropUrl: string | null = null;
    let thumbnailUrl: string | null = null;
    
    // Use Promise.allSettled to run API calls in parallel and proceed with available results
    const [tmdbResult, omdbResult, youtubeResult] = await Promise.allSettled([
      // Try TMDB first if we have a TMDB ID or search by title
      (async () => {
        if (tmdbId) {
          try {
            const tmdbResponse = await tmdbApi.get(`/movie/${tmdbId}`);
            return tmdbResponse.data;
          } catch (err) {
            // Fall back to search
            const searchQuery = year ? `${title} ${year}` : title;
            const searchResponse = await tmdbApi.get('/search/movie', {
              params: { query: searchQuery }
            });
            
            if (searchResponse.data.results && searchResponse.data.results.length > 0) {
              return searchResponse.data.results[0];
            }
            throw new Error('No TMDB results found');
          }
        } else {
          // Search by title directly
          const searchQuery = year ? `${title} ${year}` : title;
          const searchResponse = await tmdbApi.get('/search/movie', {
            params: { query: searchQuery }
          });
          
          if (searchResponse.data.results && searchResponse.data.results.length > 0) {
            return searchResponse.data.results[0];
          }
          throw new Error('No TMDB results found');
        }
      })(),
      
      // Try OMDb in parallel
      (async () => {
        if (imdbId || title) {
          const params: Record<string, string> = {};
          if (imdbId) {
            params.i = imdbId;
          } else {
            params.t = title;
            if (year) params.y = year.toString();
          }
          
          const omdbResponse = await omdbApi.get('/', { params });
          return omdbResponse.data;
        }
        throw new Error('No OMDb query parameters');
      })(),
      
      // Try YouTube in parallel
      (async () => {
        const searchQuery = `${title} ${year || ''} official trailer`;
        const youtubeResponse = await youtubeApi.get('/search', {
          params: { q: searchQuery }
        });
        
        if (youtubeResponse.data.items && youtubeResponse.data.items.length > 0) {
          return youtubeResponse.data.items[0];
        }
        throw new Error('No YouTube results found');
      })()
    ]);
    
    // Process TMDB result
    if (tmdbResult.status === 'fulfilled') {
      const tmdbData = tmdbResult.value;
      if (tmdbData.poster_path) {
        posterUrl = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
      }
      if (tmdbData.backdrop_path) {
        backdropUrl = `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}`;
      }
    }
    
    // Process OMDb result
    if (omdbResult.status === 'fulfilled' && !posterUrl) {
      const omdbData = omdbResult.value;
      if (omdbData.Poster && omdbData.Poster !== 'N/A') {
        posterUrl = omdbData.Poster;
      }
    }
    
    // Process YouTube result
    if (youtubeResult.status === 'fulfilled' && !thumbnailUrl) {
      const youtubeData = youtubeResult.value;
      const videoId = youtubeData.id.videoId;
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    const result = {
      posterUrl,
      backdropUrl,
      thumbnailUrl
    };
    
    // Cache the result
    posterCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error('Error fetching movie images:', error);
    return {
      posterUrl: null,
      backdropUrl: null,
      thumbnailUrl: null
    };
  }
};

/**
 * Enhancement function to improve movie objects with better quality images
 * @param movies Array of Movie objects
 */
export const enhanceMoviesWithBetterImages = async (movies: any[]): Promise<any[]> => {
  if (!movies || movies.length === 0) return movies;
  
  // Process movies in parallel batches of 5 to avoid overwhelming API
  const batchSize = 5;
  const enhancedMovies = [...movies];
  
  for (let i = 0; i < movies.length; i += batchSize) {
    const batch = movies.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (movie, batchIndex) => {
      try {
        const movieIndex = i + batchIndex;
        
        // Skip enhancement if we already have good images
        if (isValidImageUrl(movie.poster_path) && isValidImageUrl(movie.backdrop_path)) {
          return;
        }
        
        // Extract year from release_date if available
        const year = movie.release_date ? movie.release_date.split('-')[0] : undefined;
        
        // Get better images
        const { posterUrl, backdropUrl, thumbnailUrl } = await getPosterImages(
          movie.title,
          year,
          movie.imdbID, // Some APIs provide this
          movie.id // Assuming this might be a TMDB ID
        );
        
        // Only update if we found better images
        if (posterUrl || backdropUrl || thumbnailUrl) {
          enhancedMovies[movieIndex] = {
            ...movie,
            poster_path: posterUrl || movie.poster_path,
            backdrop_path: backdropUrl || thumbnailUrl || movie.backdrop_path,
            trailer_thumbnail: thumbnailUrl
          };
        }
      } catch (err) {
        console.log(`Failed to enhance images for ${movie.title}`);
      }
    }));
  }
  
  return enhancedMovies;
};

// Create an exportable object
const posterApiService = {
  getPosterImages,
  enhanceMoviesWithBetterImages
};

export default posterApiService; 