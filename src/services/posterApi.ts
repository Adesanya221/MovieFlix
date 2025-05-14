import axios from 'axios';

// TMDB API for high-quality movie posters and backdrops
const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: '3e12a9908d2642bc0d6466c606f81731', // Demo API key for educational purposes
  }
});

// OMDb API as a fallback for posters
const omdbApi = axios.create({
  baseURL: 'https://www.omdbapi.com',
  params: {
    apikey: '7be28dba', // Demo API key for educational purposes
  }
});

// YouTube API for trailers and thumbnails
const youtubeApi = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
  params: {
    key: 'AIzaSyDVGG7OZPN5Hw9oQ1QSfTiJN7h4K3ihJpw', // Demo API key for educational purposes
    part: 'snippet',
    maxResults: 1,
    type: 'video'
  }
});

interface PosterResult {
  posterUrl: string | null;
  backdropUrl: string | null;
  thumbnailUrl: string | null;
}

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
    let posterUrl: string | null = null;
    let backdropUrl: string | null = null;
    let thumbnailUrl: string | null = null;
    
    // Try TMDB first if we have a TMDB ID
    if (tmdbId) {
      try {
        const tmdbResponse = await tmdbApi.get(`/movie/${tmdbId}`);
        if (tmdbResponse.data.poster_path) {
          posterUrl = `https://image.tmdb.org/t/p/w500${tmdbResponse.data.poster_path}`;
        }
        if (tmdbResponse.data.backdrop_path) {
          backdropUrl = `https://image.tmdb.org/t/p/original${tmdbResponse.data.backdrop_path}`;
        }
      } catch (err) {
        console.log(`TMDB lookup by ID failed for ${title}, trying search...`);
      }
    }

    // If we don't have poster yet, try searching TMDB by title
    if (!posterUrl) {
      try {
        const searchQuery = year ? `${title} ${year}` : title;
        const searchResponse = await tmdbApi.get('/search/movie', {
          params: { query: searchQuery }
        });
        
        if (searchResponse.data.results && searchResponse.data.results.length > 0) {
          const movie = searchResponse.data.results[0];
          if (movie.poster_path) {
            posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
          }
          if (movie.backdrop_path) {
            backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
          }
        }
      } catch (err) {
        console.log(`TMDB search failed for ${title}, trying OMDb...`);
      }
    }

    // Try OMDb as a fallback
    if ((!posterUrl || !backdropUrl) && (imdbId || title)) {
      try {
        const params: Record<string, string> = {};
        if (imdbId) {
          params.i = imdbId;
        } else {
          params.t = title;
          if (year) params.y = year.toString();
        }
        
        const omdbResponse = await omdbApi.get('/', { params });
        if (omdbResponse.data.Poster && omdbResponse.data.Poster !== 'N/A' && !posterUrl) {
          posterUrl = omdbResponse.data.Poster;
        }
      } catch (err) {
        console.log(`OMDb lookup failed for ${title}`);
      }
    }

    // Try to get a YouTube thumbnail for the movie
    try {
      const searchQuery = `${title} ${year || ''} official trailer`;
      const youtubeResponse = await youtubeApi.get('/search', {
        params: { q: searchQuery }
      });
      
      if (youtubeResponse.data.items && youtubeResponse.data.items.length > 0) {
        const videoId = youtubeResponse.data.items[0].id.videoId;
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    } catch (err) {
      console.log(`YouTube thumbnail lookup failed for ${title}`);
    }

    return {
      posterUrl,
      backdropUrl,
      thumbnailUrl
    };
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
  
  const enhancedMovies = await Promise.all(movies.map(async (movie) => {
    try {
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
      return {
        ...movie,
        poster_path: posterUrl || movie.poster_path,
        backdrop_path: backdropUrl || thumbnailUrl || movie.backdrop_path,
        trailer_thumbnail: thumbnailUrl
      };
    } catch (err) {
      console.log(`Failed to enhance images for ${movie.title}`);
      return movie;
    }
  }));
  
  return enhancedMovies;
};

// Create an exportable object
const posterApiService = {
  getPosterImages,
  enhanceMoviesWithBetterImages
};

export default posterApiService; 