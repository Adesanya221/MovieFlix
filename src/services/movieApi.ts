import axios from 'axios';
import { MovieResponse, MovieDetails } from '../types/movie';

// Create a reusable axios instance with the base URL and headers
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    // In a real app, this would be stored in an environment variable
    'X-RapidAPI-Key': '6325b160bcmsh9543ea6e247cb1bp1ea9dejsn2f2866249046',
    'X-RapidAPI-Host': 'moviesdatabase.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
});

// Create a separate instance for the streaming availability API
const streamingApi = axios.create({
  baseURL: 'https://streaming-availability.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': '6325b160bcmsh9543ea6e247cb1bp1ea9dejsn2f2866249046',
    'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
});

// Define the Genre interface
export interface Genre {
  id: number;
  name: string;
}

// Fetch all genres
export const getGenres = async (): Promise<Genre[]> => {
  try {
    const response = await streamingApi.get('/genres', {
      params: { output_language: 'en' }
    });
    return response.data.result || [];
  } catch (error) {
    console.error('Error fetching genres:', error);
    return getMockGenres();
  }
};

// Fetch popular movies
export const getPopularMovies = async (page: number = 1): Promise<MovieResponse> => {
  try {
    // For development/demo purposes, we'll return mock data if API key is not set
    if (api.defaults.headers['X-RapidAPI-Key'] === 'YOUR_RAPIDAPI_KEY') {
      return getMockMovies();
    }
    
    const response = await api.get<MovieResponse>('/movie/popular', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return getMockMovies();
  }
};

// Fetch movie details by ID
export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  try {
    // For development/demo purposes, we'll return mock data if API key is not set
    if (api.defaults.headers['X-RapidAPI-Key'] === 'YOUR_RAPIDAPI_KEY') {
      return getMockMovieDetails(movieId);
    }
    
    // Handle special case for 'nw_' format IDs (they're already converted to numeric by this point)
    // So we use the same mock data
    
    const response = await api.get<MovieDetails>(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    return getMockMovieDetails(movieId);
  }
};

// Fetch similar movies by ID
export const getSimilarMovies = async (movieId: number, page: number = 1): Promise<MovieResponse> => {
  try {
    // For development/demo purposes, we'll return mock data if API key is not set
    if (api.defaults.headers['X-RapidAPI-Key'] === 'YOUR_RAPIDAPI_KEY') {
      return getMockSimilarMovies(movieId);
    }
    
    const response = await api.get<MovieResponse>(`/movie/${movieId}/similar`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching similar movies for ID ${movieId}:`, error);
    return getMockSimilarMovies(movieId);
  }
};

// Search for movies
export const searchMovies = async (query: string, page: number = 1): Promise<MovieResponse> => {
  try {
    // For development/demo purposes, we'll return mock data if API key is not set
    if (api.defaults.headers['X-RapidAPI-Key'] === 'YOUR_RAPIDAPI_KEY') {
      return getMockMovies();
    }
    
    const response = await api.get<MovieResponse>('/search/movie', {
      params: { query, page }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    return getMockMovies();
  }
};

// Mock data functions for development/demo
const getMockMovies = (): MovieResponse => {
  return {
    page: 1,
    results: Array(20).fill(null).map((_, index) => ({
      id: index + 1,
      title: `Movie Title ${index + 1}`,
      overview: 'This is a placeholder overview for a movie that would normally come from the API.',
      poster_path: '',
      backdrop_path: '',
      release_date: '2023-01-01',
      vote_average: 7.5,
      vote_count: 100,
      popularity: 100.0,
      genre_ids: [28, 12, 16] // Action, Adventure, Animation
    })),
    total_pages: 10,
    total_results: 200
  };
};

const getMockMovieDetails = (movieId: number): MovieDetails => {
  // Main movie posters and backdrops for the detail page
  const detailPosters = [
    'https://image.tmdb.org/t/p/w500/qsdjk9oAKSQMWs0Vt5Pyfh6O4GZ.jpg',
    'https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg',
    'https://image.tmdb.org/t/p/w500/5KCVkau1HEl7ZzfPsKAPM0sMiKc.jpg',
    'https://image.tmdb.org/t/p/w500/lmZFxXgJE3vgrciwuDib0N8CfQo.jpg',
    'https://image.tmdb.org/t/p/w500/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg'
  ];
  
  const detailBackdrops = [
    'https://image.tmdb.org/t/p/original/oE6bhqqVFyIECtBzqIuvh6JdaB5.jpg',
    'https://image.tmdb.org/t/p/original/wXuzd8KQZmXVmRe9xQo9TxgkF7E.jpg',
    'https://image.tmdb.org/t/p/original/kaIfm5ryEOwYg8mLbq8HkPuM1Fo.jpg',
    'https://image.tmdb.org/t/p/original/feSiISwgELRCII2yVBzvki6O0Mq.jpg',
    'https://image.tmdb.org/t/p/original/dq18nCTTLpy9PmtzZI6Y2yAgdw5.jpg'
  ];

  // Movie titles based on ID
  const movieTitles = [
    "The Avengers",
    "Inception",
    "The Dark Knight",
    "Interstellar",
    "Spider-Man: Into the Spider-Verse",
    "Mad Max: Fury Road",
    "Joker",
    "The Matrix",
    "Parasite",
    "Jurassic Park"
  ];

  // Pick a consistent index based on movie ID to get the same data for the same movie
  const detailIndex = movieId % detailPosters.length;
  const titleIndex = movieId % movieTitles.length;
  
  return {
    id: movieId,
    title: movieTitles[titleIndex] || `Movie ${movieId}`,
    overview: 'This is a placeholder overview for a movie that would normally come from the API.',
    poster_path: detailPosters[detailIndex],
    backdrop_path: detailBackdrops[detailIndex],
    release_date: '2023-01-01',
    vote_average: 7.5,
    vote_count: 100,
    popularity: 100.0,
    genre_ids: [28, 12, 16],
    genres: [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' }
    ],
    runtime: 120,
    tagline: 'A mock movie tagline',
    status: 'Released',
    budget: 1000000,
    revenue: 5000000
  };
};

// Mock similar movies data for development/demo
const getMockSimilarMovies = (movieId: number): MovieResponse => {
  // Create an array of movie poster placeholders from a movie poster API
  const posterPlaceholders = [
    'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    'https://image.tmdb.org/t/p/w500/bQXAqRx2Fgc46uCVWgoPz5L5Dtr.jpg',
    'https://image.tmdb.org/t/p/w500/hEjK9A9BkNXejFW4tfacVAEHtkn.jpg',
    'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    'https://image.tmdb.org/t/p/w500/pU1ULUq8D3iRxl1fdX2lZIzdHuI.jpg',
    'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    'https://image.tmdb.org/t/p/w500/8kOWDBK6XlPUzckuHDo3wwVRFwt.jpg',
    'https://image.tmdb.org/t/p/w500/dm06L9pxDOL9jNSK4Cb6y139rrG.jpg',
    'https://image.tmdb.org/t/p/w500/tnmdUnztAYbfJ0jhjpN6oxwP2sb.jpg',
    'https://image.tmdb.org/t/p/w500/keIxh0wVr58n4J0xDIkO3TiX1Jz.jpg'
  ];

  // Backdrop placeholders
  const backdropPlaceholders = [
    'https://image.tmdb.org/t/p/original/52AfXWuXCHn3UjD17rBruA9f5qb.jpg',
    'https://image.tmdb.org/t/p/original/6LfVuZBiOOCtqch5Ukspjb9y0EB.jpg',
    'https://image.tmdb.org/t/p/original/a4xA6nmFa7xJ2PCt39EY3OhxoR1.jpg',
    'https://image.tmdb.org/t/p/original/1Rr5SrvHxMXHu5RjKpaMba8VTzi.jpg',
    'https://image.tmdb.org/t/p/original/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
    'https://image.tmdb.org/t/p/original/n1y094tVDFATSzkTnFxoGZ1qNsG.jpg',
    'https://image.tmdb.org/t/p/original/5myQbDzw3l8K9yofUXRJ4UTVgam.jpg',
    'https://image.tmdb.org/t/p/original/9DepxPQVheJbCAPk1qQ2B4QfolW.jpg',
    'https://image.tmdb.org/t/p/original/2rJnmdjALpUj6ILEaj3ERcGtTLJ.jpg',
    'https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2QM528GlEDHfsj.jpg',
    'https://image.tmdb.org/t/p/original/mmrRamJJXDQTzW8lBYfU1uPjdpP.jpg',
    'https://image.tmdb.org/t/p/original/fgsHxz21B27hOOqQBiw9L6yWcM7.jpg'
  ];

  const movieTitles = [
    'The Avengers',
    'Inception',
    'The Dark Knight',
    'Interstellar',
    'Black Panther',
    'Spider-Man: Into the Spider-Verse',
    'Mad Max: Fury Road',
    'Parasite',
    'John Wick',
    'The Matrix',
    'Jurassic Park',
    'Blade Runner 2049'
  ];

  return {
    page: 1,
    results: Array(12).fill(null).map((_, index) => ({
      id: movieId + 100 + index,
      title: movieTitles[index],
      overview: 'This is a placeholder overview for a similar movie that would normally come from the API.',
      poster_path: posterPlaceholders[index],
      backdrop_path: backdropPlaceholders[index],
      release_date: '2023-01-01',
      vote_average: 7.5 + (Math.random() * 2 - 1),
      vote_count: 100,
      popularity: 100.0,
      genre_ids: [28, 12, 16] // Action, Adventure, Animation
    })),
    total_pages: 5,
    total_results: 60
  };
};

// Mock data for genres
const getMockGenres = (): Genre[] => {
  return [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
  ];
}; 