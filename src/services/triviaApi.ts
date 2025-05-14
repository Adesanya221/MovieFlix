import axios from 'axios';

// IMDb API for movie trivia
const imdbApi = axios.create({
  baseURL: 'https://imdb-api.com/en/API',
  params: {
    apiKey: 'k_12345678', // Replace with your actual API key
  },
  timeout: 5000
});

// Alternative API (OMDb) for fallback
const omdbApi = axios.create({
  baseURL: 'https://www.omdbapi.com',
  params: {
    apikey: '7be28dba', // Demo API key for educational purposes
  },
  timeout: 5000
});

// Cache structure for trivia data
interface TriviaCache {
  [key: string]: {
    data: any;
    timestamp: number;
  }
}

// Cache expiration time (1 hour - trivia doesn't change often)
const CACHE_EXPIRY = 60 * 60 * 1000;

// Global trivia cache
const triviaCache: TriviaCache = {};

export interface MovieTrivia {
  facts: string[];
  goofs: string[];
  quotes: string[];
  didYouKnow: string[];
  taglines: string[];
  awards: string[];
}

/**
 * Get trivia for a movie by its IMDb ID
 * @param imdbId - IMDb ID of the movie
 * @returns MovieTrivia object with various trivia categories
 */
export const getMovieTrivia = async (imdbId: string): Promise<MovieTrivia> => {
  try {
    // Generate cache key
    const cacheKey = `trivia_${imdbId}`;
    
    // Check cache first
    if (triviaCache[cacheKey] && 
        (Date.now() - triviaCache[cacheKey].timestamp) < CACHE_EXPIRY) {
      console.log('Using cached trivia for:', imdbId);
      return triviaCache[cacheKey].data;
    }
    
    console.log(`Fetching trivia for IMDb ID: ${imdbId}`);
    
    // Make parallel requests for different trivia types
    const [triviaResponse, goofsResponse, quotesResponse] = await Promise.allSettled([
      imdbApi.get(`/Title/${imdbId}/Trivia`),
      imdbApi.get(`/Title/${imdbId}/Goofs`),
      imdbApi.get(`/Title/${imdbId}/Quotes`)
    ]);
    
    // Extract trivia items from responses
    let facts: string[] = [];
    let goofs: string[] = [];
    let quotes: string[] = [];
    let didYouKnow: string[] = [];
    
    if (triviaResponse.status === 'fulfilled' && triviaResponse.value.data.items) {
      facts = triviaResponse.value.data.items.slice(0, 10).map((item: any) => item.text);
    }
    
    if (goofsResponse.status === 'fulfilled' && goofsResponse.value.data.items) {
      goofs = goofsResponse.value.data.items.slice(0, 5).map((item: any) => item.text);
    }
    
    if (quotesResponse.status === 'fulfilled' && quotesResponse.value.data.items) {
      quotes = quotesResponse.value.data.items.slice(0, 8).map((item: any) => item.text);
    }
    
    // Get additional data from OMDb as backup
    try {
      const omdbResponse = await omdbApi.get('/', {
        params: { i: imdbId, plot: 'full' }
      });
      
      const taglines = omdbResponse.data.Tagline ? [omdbResponse.data.Tagline] : [];
      const awards = omdbResponse.data.Awards ? [omdbResponse.data.Awards] : [];
      
      // Create additional "Did You Know" facts from OMDb data
      if (omdbResponse.data.BoxOffice && omdbResponse.data.BoxOffice !== 'N/A') {
        didYouKnow.push(`This movie grossed ${omdbResponse.data.BoxOffice} at the box office.`);
      }
      
      if (omdbResponse.data.Production && omdbResponse.data.Production !== 'N/A') {
        didYouKnow.push(`This film was produced by ${omdbResponse.data.Production}.`);
      }
      
      if (omdbResponse.data.Director && omdbResponse.data.Director !== 'N/A') {
        didYouKnow.push(`Directed by ${omdbResponse.data.Director}.`);
      }
      
      // Compile trivia object
      const movieTrivia: MovieTrivia = {
        facts,
        goofs,
        quotes,
        didYouKnow,
        taglines,
        awards
      };
      
      // Cache the result
      triviaCache[cacheKey] = {
        data: movieTrivia,
        timestamp: Date.now()
      };
      
      return movieTrivia;
      
    } catch (omdbError) {
      console.error('Error fetching OMDb data:', omdbError);
      
      // Return what we have so far
      const movieTrivia: MovieTrivia = {
        facts,
        goofs,
        quotes,
        didYouKnow: [],
        taglines: [],
        awards: []
      };
      
      // Cache the result
      triviaCache[cacheKey] = {
        data: movieTrivia,
        timestamp: Date.now()
      };
      
      return movieTrivia;
    }
    
  } catch (error) {
    console.error('Error fetching movie trivia:', error);
    
    // Return empty trivia on error
    return {
      facts: [],
      goofs: [],
      quotes: [],
      didYouKnow: [],
      taglines: [],
      awards: []
    };
  }
};

/**
 * Get IMDb ID for a movie using its TMDB ID
 * @param tmdbId - TMDB ID of the movie
 * @returns Promise with IMDb ID if found
 */
export const getImdbIdFromTmdb = async (tmdbId: number | string): Promise<string | null> => {
  try {
    // Check cache first
    const cacheKey = `imdb_from_tmdb_${tmdbId}`;
    
    if (triviaCache[cacheKey] && 
        (Date.now() - triviaCache[cacheKey].timestamp) < CACHE_EXPIRY) {
      console.log('Using cached IMDb ID for TMDB ID:', tmdbId);
      return triviaCache[cacheKey].data;
    }
    
    // Use TMDB API to get external IDs
    const tmdbApi = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      params: {
        api_key: '3e12a9908d2642bc0d6466c606f81731', // Demo API key
      }
    });
    
    const response = await tmdbApi.get(`/movie/${tmdbId}/external_ids`);
    const imdbId = response.data.imdb_id;
    
    // Cache the result
    triviaCache[cacheKey] = {
      data: imdbId,
      timestamp: Date.now()
    };
    
    return imdbId;
  } catch (error) {
    console.error(`Error getting IMDb ID for TMDB ID ${tmdbId}:`, error);
    return null;
  }
};

/**
 * Get movie trivia using a TMDB ID instead of IMDb ID
 * @param tmdbId - TMDB ID of the movie
 * @returns Promise with MovieTrivia object
 */
export const getMovieTriviaByTmdbId = async (tmdbId: number | string): Promise<MovieTrivia> => {
  try {
    const imdbId = await getImdbIdFromTmdb(tmdbId);
    
    if (imdbId) {
      return getMovieTrivia(imdbId);
    } else {
      throw new Error('Could not find IMDb ID for the given TMDB ID');
    }
  } catch (error) {
    console.error('Error fetching movie trivia by TMDB ID:', error);
    
    // Return empty trivia on error
    return {
      facts: [],
      goofs: [],
      quotes: [],
      didYouKnow: [],
      taglines: [],
      awards: []
    };
  }
};

// Export triviaApi as a named constant
const triviaApi = {
  getMovieTrivia,
  getImdbIdFromTmdb,
  getMovieTriviaByTmdbId
};

export default triviaApi; 