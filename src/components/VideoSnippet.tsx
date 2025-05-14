import React, { useState } from 'react';

interface VideoSnippetProps {
  videoId: string;
  thumbnailUrl: string;
  title: string;
}

const VideoSnippet: React.FC<VideoSnippetProps> = ({ videoId, thumbnailUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handlePlayVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(true);
  };
  
  const handleCloseVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(false);
  };
  
  return (
    <div className="relative">
      {/* Thumbnail with play button */}
      <div 
        className="relative aspect-video rounded-md overflow-hidden cursor-pointer netflix-card-shadow"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePlayVideo}
      >
        {/* Thumbnail image */}
        <img 
          src={thumbnailUrl} 
          alt={`${title} trailer`} 
          className="w-full h-full object-cover"
        />
        
        {/* Hover overlay */}
        <div 
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        ></div>
        
        {/* Play button */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-70 scale-90'
          }`}
        >
          <div className="h-16 w-16 rounded-full bg-black/60 border-2 border-white flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        
        {/* Netflix label */}
        <div className="absolute bottom-4 left-4 text-white font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-netflix-red mr-2">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
          <span>Trailer</span>
        </div>
      </div>
      
      {/* Video overlay (shown when playing) */}
      {isPlaying && (
        <div className="netflix-video-overlay netflix-fadein" onClick={handleCloseVideo}>
          <div className="relative w-full max-w-4xl netflix-slideup" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-10 right-0 text-white hover:text-netflix-red"
              onClick={handleCloseVideo}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="aspect-video w-full rounded-md overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
                title={`${title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSnippet; 