import axios from 'axios';

// YouTube API instance
const youtubeApi = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
  params: {
    key: 'AIzaSyDVGG7OZPN5Hw9oQ1QSfTiJN7h4K3ihJpw', // Demo API key for educational purposes
    part: 'snippet',
    maxResults: 1,
    type: 'video'
  }
});

export interface TrailerInfo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  description: string;
  publishedAt: string;
}

/**
 * Fetch a movie trailer from YouTube
 * @param movieTitle The title of the movie
 * @param year Optional release year
 * @returns TrailerInfo or null if not found
 */
export const fetchMovieTrailer = async (
  movieTitle: string,
  year?: string | number
): Promise<TrailerInfo | null> => {
  try {
    const searchQuery = `${movieTitle} ${year || ''} official trailer`;
    const response = await youtubeApi.get('/search', {
      params: {
        q: searchQuery
      }
    });
    
    if (response.data.items && response.data.items.length > 0) {
      const item = response.data.items[0];
      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching movie trailer:', error);
    return null;
  }
};

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param url YouTube URL
 * @returns Video ID or null if invalid
 */
export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  // Regular expressions for different YouTube URL formats
  const regexps = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]*)/,
    /youtube\.com\/embed\/([^&\?]*)/,
    /youtube\.com\/v\/([^&\?]*)/,
    /youtube\.com\/user\/[^\/]+\/\?v=([^&\?]*)/
  ];
  
  for (const regex of regexps) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Get a thumbnail URL for a YouTube video
 * @param videoId YouTube video ID
 * @param quality Thumbnail quality (default/medium/high/standard/maxres)
 * @returns Thumbnail URL
 */
export const getYouTubeThumbnail = (
  videoId: string, 
  quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'maxres'
): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
};

export default {
  fetchMovieTrailer,
  extractYouTubeId,
  getYouTubeThumbnail
}; 