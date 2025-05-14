import axios from 'axios';

// Tenor API for GIFs
const tenorApi = axios.create({
  baseURL: 'https://tenor.googleapis.com/v2',
  params: {
    key: 'AIzaSyDVGG7OZPN5Hw9oQ1QSfTiJN7h4K3ihJpw', // Demo API key for educational purposes
    client_key: 'movieflix_app'
  },
  timeout: 5000
});

// GIPHY API as fallback
const giphyApi = axios.create({
  baseURL: 'https://api.giphy.com/v1/gifs',
  params: {
    api_key: 'Gc7131jiJuvI7IdN0HZ1D7nh0ow5BU6g', // Demo API key for educational purposes
  },
  timeout: 5000
});

// Cache structure for GIF data
interface GifCache {
  [key: string]: {
    data: GifResponse;
    timestamp: number;
  }
}

// Cache expiration time (1 hour)
const CACHE_EXPIRY = 60 * 60 * 1000;

// Global GIF cache
const gifCache: GifCache = {};

export interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
}

export interface GifResponse {
  gifs: GifItem[];
  next: string;
}

/**
 * Search for reaction GIFs based on a query
 * @param query - Search term (e.g., "wow", "shocked", "laughing")
 * @param limit - Maximum number of results to return
 * @returns Promise with GIF response
 */
export const searchGifs = async (query: string, limit: number = 8): Promise<GifResponse> => {
  try {
    // Add "movie" to the query for more relevant results
    const searchQuery = query.includes('movie') ? query : `${query} movie`;
    
    // Generate cache key
    const cacheKey = `gifs_${searchQuery.toLowerCase()}_${limit}`;
    
    // Check cache first
    if (gifCache[cacheKey] && 
        (Date.now() - gifCache[cacheKey].timestamp) < CACHE_EXPIRY) {
      console.log('Using cached GIFs for:', searchQuery);
      return gifCache[cacheKey].data;
    }
    
    console.log(`Searching GIFs for: ${searchQuery}`);
    
    // Try Tenor API first
    try {
      const response = await tenorApi.get('/search', {
        params: {
          q: searchQuery,
          limit
        }
      });
      
      const gifs: GifItem[] = response.data.results.map((result: any) => {
        const mediaFormats = result.media_formats;
        return {
          id: result.id,
          title: result.title || 'Reaction GIF',
          url: mediaFormats.gif?.url || mediaFormats.mediumgif?.url || '',
          previewUrl: mediaFormats.tinygif?.url || mediaFormats.nanogif?.url || '',
          width: mediaFormats.gif?.dims?.[0] || 300,
          height: mediaFormats.gif?.dims?.[1] || 200
        };
      });
      
      const gifResponse: GifResponse = {
        gifs,
        next: response.data.next || ''
      };
      
      // Cache the result
      gifCache[cacheKey] = {
        data: gifResponse,
        timestamp: Date.now()
      };
      
      return gifResponse;
    } catch (tenorError) {
      console.error('Error fetching GIFs from Tenor:', tenorError);
      throw tenorError; // Let it fallback to GIPHY
    }
  } catch (error) {
    console.log('Trying GIPHY API as fallback');
    
    // Fallback to GIPHY API
    try {
      const response = await giphyApi.get('/search', {
        params: {
          q: query,
          limit
        }
      });
      
      const gifs: GifItem[] = response.data.data.map((result: any) => ({
        id: result.id,
        title: result.title || 'Reaction GIF',
        url: result.images.fixed_height.url || result.images.original.url,
        previewUrl: result.images.fixed_height_small.url || result.images.fixed_height_downsampled.url,
        width: parseInt(result.images.fixed_height.width) || 300,
        height: parseInt(result.images.fixed_height.height) || 200
      }));
      
      const gifResponse: GifResponse = {
        gifs,
        next: response.data.pagination.total_count > limit ? 'more' : ''
      };
      
      // Cache the GIPHY result
      const cacheKey = `gifs_${query.toLowerCase()}_${limit}`;
      gifCache[cacheKey] = {
        data: gifResponse,
        timestamp: Date.now()
      };
      
      return gifResponse;
    } catch (giphyError) {
      console.error('Error fetching GIFs from GIPHY:', giphyError);
      
      // Return empty results if both APIs fail
      return {
        gifs: [],
        next: ''
      };
    }
  }
};

/**
 * Get trending reaction GIFs
 * @param limit - Maximum number of results to return
 * @returns Promise with GIF response
 */
export const getTrendingGifs = async (limit: number = 8): Promise<GifResponse> => {
  try {
    // Generate cache key
    const cacheKey = `gifs_trending_${limit}`;
    
    // Check cache first
    if (gifCache[cacheKey] && 
        (Date.now() - gifCache[cacheKey].timestamp) < CACHE_EXPIRY) {
      console.log('Using cached trending GIFs');
      return gifCache[cacheKey].data;
    }
    
    console.log('Fetching trending GIFs');
    
    // Try Tenor API first
    try {
      const response = await tenorApi.get('/featured', {
        params: {
          limit
        }
      });
      
      const gifs: GifItem[] = response.data.results.map((result: any) => {
        const mediaFormats = result.media_formats;
        return {
          id: result.id,
          title: result.title || 'Trending GIF',
          url: mediaFormats.gif?.url || mediaFormats.mediumgif?.url || '',
          previewUrl: mediaFormats.tinygif?.url || mediaFormats.nanogif?.url || '',
          width: mediaFormats.gif?.dims?.[0] || 300,
          height: mediaFormats.gif?.dims?.[1] || 200
        };
      });
      
      const gifResponse: GifResponse = {
        gifs,
        next: response.data.next || ''
      };
      
      // Cache the result
      gifCache[cacheKey] = {
        data: gifResponse,
        timestamp: Date.now()
      };
      
      return gifResponse;
    } catch (tenorError) {
      console.error('Error fetching trending GIFs from Tenor:', tenorError);
      throw tenorError; // Let it fallback to GIPHY
    }
  } catch (error) {
    console.log('Trying GIPHY API as fallback for trending GIFs');
    
    // Fallback to GIPHY API
    try {
      const response = await giphyApi.get('/trending', {
        params: {
          limit
        }
      });
      
      const gifs: GifItem[] = response.data.data.map((result: any) => ({
        id: result.id,
        title: result.title || 'Trending GIF',
        url: result.images.fixed_height.url || result.images.original.url,
        previewUrl: result.images.fixed_height_small.url || result.images.fixed_height_downsampled.url,
        width: parseInt(result.images.fixed_height.width) || 300,
        height: parseInt(result.images.fixed_height.height) || 200
      }));
      
      const gifResponse: GifResponse = {
        gifs,
        next: response.data.pagination.total_count > limit ? 'more' : ''
      };
      
      // Cache the GIPHY result
      const cacheKey = `gifs_trending_${limit}`;
      gifCache[cacheKey] = {
        data: gifResponse,
        timestamp: Date.now()
      };
      
      return gifResponse;
    } catch (giphyError) {
      console.error('Error fetching trending GIFs from GIPHY:', giphyError);
      
      // Return empty results if both APIs fail
      return {
        gifs: [],
        next: ''
      };
    }
  }
};

/**
 * Get movie-related reaction GIFs for specific emotions
 * @param emotion - Emotion like "laugh", "cry", "shock", etc.
 * @param limit - Maximum number of results to return
 * @returns Promise with GIF response
 */
export const getMovieReactionGifs = async (emotion: string, limit: number = 8): Promise<GifResponse> => {
  // Add movie context to make results more relevant
  const movieContext = ['movie reaction', 'movie scene', 'film reaction', 'cinema reaction'];
  const randomContext = movieContext[Math.floor(Math.random() * movieContext.length)];
  
  return searchGifs(`${emotion} ${randomContext}`, limit);
};

// Export gifApi as a named constant
const gifApi = {
  searchGifs,
  getTrendingGifs,
  getMovieReactionGifs
};

export default gifApi; 