import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useMovieDetails from '../hooks/useMovieDetails';
import useWatchParty from '../hooks/useWatchParty';
import useReactionGifs from '../hooks/useReactionGifs';

const WatchPartyPage: React.FC = () => {
  const { id = '0' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Local state
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [showGifs, setShowGifs] = useState<boolean>(false);
  const [accessCode, setAccessCode] = useState<string>('');
  const [partyId, setPartyId] = useState<string>('');
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  
  // Mock user info (in a real app, this would come from authentication)
  const userId = 'user_' + Math.floor(Math.random() * 10000);
  const userName = 'User' + userId.substring(5);
  
  // Get movie details
  const { movie, loading: movieLoading } = useMovieDetails(parseInt(id, 10));
  
  // Get watch party and reaction GIFs
  const { 
    currentParty, 
    messages, 
    playbackState, 
    isConnected,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isHost,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loading,
    createWatchParty,
    joinWatchParty,
    leaveWatchParty,
    sendChatMessage,
    sendReaction,
    updatePlaybackState
  } = useWatchParty(userId, userName);
  
  const { 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    trendingGifs, 
    searchGifs, 
    gifs,
    loading: gifsLoading 
  } = useReactionGifs();
  
  // Effect to scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Effect to sync video playback with party state
  useEffect(() => {
    if (!videoRef.current || !playbackState || !isConnected) return;
    
    // Don't update if it's the local user who made the change
    if (playbackState.lastUpdated === Date.now()) return;
    
    // Sync playback position
    const timeDiff = Math.abs(videoRef.current.currentTime - playbackState.currentTime);
    if (timeDiff > 2) {
      videoRef.current.currentTime = playbackState.currentTime;
    }
    
    // Sync play/pause state
    if (playbackState.isPlaying && videoRef.current.paused) {
      videoRef.current.play();
    } else if (!playbackState.isPlaying && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [playbackState, isConnected]);
  
  // Handle creating a new watch party
  const handleCreateParty = async () => {
    if (!movie) return;
    
    try {
      const party = await createWatchParty(movie.id, movie.title, isPrivate);
      console.log('Created watch party:', party);
      
      // If it's a private party, show the access code
      if (isPrivate && party.accessCode) {
        // In a real app, you might show a modal or copy to clipboard
        alert(`Share this access code with friends: ${party.accessCode}`);
      }
    } catch (err) {
      console.error('Error creating watch party:', err);
    }
  };
  
  // Handle joining an existing watch party
  const handleJoinParty = async () => {
    try {
      const party = await joinWatchParty(partyId, accessCode);
      console.log('Joined watch party:', party);
      setShowJoinModal(false);
    } catch (err) {
      console.error('Error joining watch party:', err);
    }
  };
  
  // Handle leaving the watch party
  const handleLeaveParty = () => {
    leaveWatchParty();
    navigate(`/movie/${id}`);
  };
  
  // Handle video play/pause
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    const isPlaying = !videoRef.current.paused;
    updatePlaybackState(videoRef.current.currentTime, isPlaying);
  };
  
  // Handle video seeking
  const handleTimeUpdate = () => {
    if (!videoRef.current || !isConnected) return;
    
    // Only update every 5 seconds to avoid too many updates
    if (Math.floor(videoRef.current.currentTime) % 5 === 0) {
      updatePlaybackState(videoRef.current.currentTime, !videoRef.current.paused);
    }
  };
  
  // Handle sending chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatMessage.trim()) return;
    
    sendChatMessage(chatMessage);
    setChatMessage('');
    
    // Focus the input again
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  };
  
  // Handle sending a reaction GIF
  const handleSendGif = (gifUrl: string, title: string) => {
    sendReaction(title, gifUrl);
    setShowGifs(false);
  };
  
  // Handle searching for GIFs
  const handleSearchGifs = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatMessage.trim()) return;
    
    searchGifs(chatMessage);
    setShowGifs(true);
  };
  
  if (movieLoading) {
    return (
      <div className="min-h-screen bg-netflix-black pt-20 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="min-h-screen bg-netflix-black pt-32">
        <div className="netflix-container">
          <div className="max-w-lg mx-auto bg-netflix-dark p-8 rounded-lg text-center">
            <h2 className="text-2xl font-medium text-white mb-4">
              Movie not found
            </h2>
            <p className="text-gray-400 mb-6">
              Sorry, we couldn't find the movie you're looking for.
            </p>
            <Link 
              to="/" 
              className="inline-block bg-netflix-red hover:bg-netflix-red/80 transition-colors text-white px-6 py-2 rounded"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Watch Party Header */}
      <div className="bg-netflix-dark shadow-lg">
        <div className="netflix-container mobile-safe-area py-2 md:py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-white text-base md:text-xl font-bold prevent-overflow">{isConnected ? currentParty?.name : 'Start Watch Party'}</h1>
            {isConnected && currentParty?.isPrivate && (
              <span className="ml-2 md:ml-3 bg-green-600 text-white text-xs px-2 py-1 rounded">Private</span>
            )}
          </div>
          
          {isConnected ? (
            <button 
              onClick={handleLeaveParty}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center text-sm md:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm9 5a1 1 0 00-1-1H5a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V8z" clipRule="evenodd" />
              </svg>
              Leave
            </button>
          ) : (
            <div className="flex items-center space-x-2 md:space-x-3 text-sm md:text-base">
              <button 
                onClick={() => setShowJoinModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                Join
              </button>
              <button 
                onClick={handleCreateParty}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Create
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="netflix-container py-3 md:py-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 overflow-hidden">
        {/* Left Column - Video Player */}
        <div className="md:col-span-2">
          <div className="bg-netflix-dark rounded-lg overflow-hidden">
            {/* Video Player */}
            <div className="relative aspect-video">
              {/* Placeholder for actual streaming video */}
              <video
                ref={videoRef}
                poster={movie.backdrop_path}
                controls
                onPlay={handlePlayPause}
                onPause={handlePlayPause}
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full"
                playsInline
              >
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Party Status Overlay */}
              {isConnected && (
                <div className="absolute top-2 right-2 bg-black/80 text-white text-xs md:text-sm px-2 md:px-3 py-1 rounded-full flex items-center">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 mr-1 md:mr-2"></span>
                  {currentParty?.participants.length} Watching
                </div>
              )}
            </div>
            
            {/* Video Info */}
            <div className="p-3 md:p-4">
              <h2 className="text-xl md:text-2xl font-bold text-white prevent-overflow">{movie.title}</h2>
              <p className="text-gray-400 mt-1 text-sm">{movie.release_date.split('-')[0]} • {movie.vote_average.toFixed(1)} ⭐</p>
              <p className="text-gray-300 mt-2 md:mt-3 text-sm md:text-base prevent-overflow">{movie.overview}</p>
              
              {/* Create Party Options (only shown when not connected) */}
              {!isConnected && (
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-netflix-black/50 rounded-lg">
                  <h3 className="text-base md:text-lg font-medium text-white mb-3">Watch Party Options</h3>
                  
                  <div className="flex items-center mb-4">
                    <input 
                      type="checkbox" 
                      id="privateParty" 
                      checked={isPrivate}
                      onChange={() => setIsPrivate(!isPrivate)}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="privateParty" className="ml-2 text-gray-300 text-sm md:text-base">
                      Make this a private watch party
                    </label>
                  </div>
                  
                  <button 
                    onClick={handleCreateParty}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
                  >
                    Start Watching Together
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - Chat and Reactions */}
        <div className="md:col-span-1">
          <div className="bg-netflix-dark rounded-lg overflow-hidden h-full flex flex-col">
            <div className="p-2 md:p-3 bg-netflix-dark/80 border-b border-gray-800">
              <h3 className="text-white font-medium text-sm md:text-base">Watch Party Chat</h3>
            </div>
            
            {isConnected ? (
              <>
                {/* Chat Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-3 max-h-[350px] md:max-h-[500px]"
                >
                  {messages.map((message, index) => (
                    <div key={index} className={`${
                      message.type === 'system' 
                        ? 'text-center text-gray-500 text-xs md:text-sm py-1' 
                        : message.senderId === userId 
                          ? 'text-right' 
                          : 'text-left'
                    }`}>
                      {message.type === 'system' ? (
                        <div className="bg-gray-800/50 inline-block px-2 md:px-3 py-1 rounded text-xs md:text-sm">
                          {message.content}
                        </div>
                      ) : message.type === 'reaction' ? (
                        <div className={`inline-block max-w-[90%] ${
                          message.senderId === userId ? 'bg-blue-600' : 'bg-gray-700'
                        } rounded-lg p-2`}>
                          <p className={`text-xs ${
                            message.senderId === userId ? 'text-blue-200' : 'text-gray-400'
                          }`}>
                            {message.senderId === userId ? 'You' : message.senderName}
                          </p>
                          {message.reactionGifUrl && (
                            <div className="mt-1 max-w-full overflow-hidden rounded">
                              <img 
                                src={message.reactionGifUrl} 
                                alt={message.content}
                                className="w-full object-contain"
                                style={{ maxHeight: '120px' }}
                                loading="lazy"
                              />
                            </div>
                          )}
                          <p className="text-white text-xs md:text-sm mt-1 break-words">{message.content}</p>
                        </div>
                      ) : (
                        <div className={`inline-block max-w-[90%] ${
                          message.senderId === userId ? 'bg-blue-600' : 'bg-gray-700'
                        } rounded-lg p-2`}>
                          <p className={`text-xs ${
                            message.senderId === userId ? 'text-blue-200' : 'text-gray-400'
                          }`}>
                            {message.senderId === userId ? 'You' : message.senderName}
                          </p>
                          <p className="text-white text-xs md:text-sm break-words">{message.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 text-xs md:text-sm my-10">
                      <p>No messages yet. Say hello!</p>
                    </div>
                  )}
                </div>
                
                {/* Reaction GIFs Panel */}
                {showGifs && (
                  <div className="p-2 md:p-3 border-t border-gray-800 bg-netflix-black/30">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white text-xs md:text-sm font-medium">Reaction GIFs</h4>
                      <button 
                        onClick={() => setShowGifs(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-40 md:max-h-60 overflow-y-auto">
                      {gifsLoading ? (
                        <div className="col-span-2 text-center py-4">
                          <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-netflix-red border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                      ) : gifs.length > 0 ? (
                        gifs.map(gif => (
                          <div 
                            key={gif.id}
                            onClick={() => handleSendGif(gif.url, gif.title)}
                            className="cursor-pointer rounded overflow-hidden hover:ring-2 hover:ring-netflix-red"
                          >
                            <img 
                              src={gif.previewUrl || gif.url} 
                              alt={gif.title}
                              className="w-full h-20 md:h-24 object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-4 text-gray-400 text-xs md:text-sm">
                          No GIFs found. Try a different search term.
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Chat Input */}
                <div className="p-2 md:p-3 border-t border-gray-800">
                  <form onSubmit={handleSendMessage} className="flex">
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 text-white text-sm px-2 md:px-3 py-1 md:py-2 rounded-l-md focus:outline-none"
                    />
                    
                    <button
                      type="button"
                      onClick={handleSearchGifs}
                      className="bg-gray-700 text-white text-sm px-2 md:px-3 hover:bg-gray-600"
                    >
                      GIF
                    </button>
                    
                    <button
                      type="submit"
                      className="bg-netflix-red text-white text-sm px-3 md:px-4 py-1 md:py-2 rounded-r-md hover:bg-netflix-red/80"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h10" />
                </svg>
                <h3 className="text-white text-lg font-medium mb-2">Join or create a watch party</h3>
                <p className="text-gray-400 mb-6">Watch movies together with friends and chat in real-time</p>
                
                <div className="space-y-3 w-full">
                  <button 
                    onClick={() => setShowJoinModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                  >
                    Join Existing Party
                  </button>
                  
                  <button 
                    onClick={handleCreateParty}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                  >
                    Create New Party
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Back Button */}
      <div className="netflix-container py-4">
        <Link 
          to={`/movie/${id}`}
          className="inline-flex items-center text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Movie
        </Link>
      </div>
      
      {/* Join Party Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4">
          <div className="bg-netflix-dark rounded-lg w-full max-w-sm md:max-w-md p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Join Watch Party</h3>
            
            <div className="space-y-3 md:space-y-4">
              <div>
                <label htmlFor="partyId" className="block text-gray-300 text-sm mb-1">Party ID</label>
                <input
                  id="partyId"
                  type="text"
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  placeholder="Enter the party ID"
                  className="w-full bg-gray-800 text-white text-sm px-3 py-2 rounded-md focus:outline-none"
                />
              </div>
              
              <div>
                <label htmlFor="accessCode" className="block text-gray-300 text-sm mb-1">Access Code (if private)</label>
                <input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter access code if needed"
                  className="w-full bg-gray-800 text-white text-sm px-3 py-2 rounded-md focus:outline-none"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-3 md:pt-4">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="bg-gray-700 text-white text-sm px-3 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinParty}
                  disabled={!partyId.trim()}
                  className={`${
                    !partyId.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-netflix-red hover:bg-netflix-red/80'
                  } text-white text-sm px-3 py-2 rounded`}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchPartyPage; 