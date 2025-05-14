import { useState, useEffect, useCallback } from 'react';
import watchPartyManager, { 
  WatchParty, 
  WatchPartyMessage,
  WatchPartyState
} from '../services/watchPartyApi';

interface UseWatchPartyReturn {
  currentParty: WatchParty | null;
  messages: WatchPartyMessage[];
  playbackState: WatchPartyState | null;
  isConnected: boolean;
  isHost: boolean;
  error: string | null;
  loading: boolean;
  
  // Watch party actions
  createWatchParty: (movieId: number | string, movieTitle: string, isPrivate?: boolean) => Promise<WatchParty>;
  joinWatchParty: (partyId: string, accessCode?: string) => Promise<WatchParty>;
  leaveWatchParty: () => void;
  sendChatMessage: (content: string) => void;
  sendReaction: (content: string, gifUrl: string) => void;
  updatePlaybackState: (currentTime: number, isPlaying: boolean) => void;
}

/**
 * Hook to manage watch party functionality
 * @param userId - Current user's ID
 * @param userName - Current user's display name
 * @returns Object with watch party state and functions
 */
const useWatchParty = (userId: string, userName: string): UseWatchPartyReturn => {
  const [currentParty, setCurrentParty] = useState<WatchParty | null>(null);
  const [messages, setMessages] = useState<WatchPartyMessage[]>([]);
  const [playbackState, setPlaybackState] = useState<WatchPartyState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Set user info on the watch party manager
  useEffect(() => {
    watchPartyManager.setUserInfo(userId, userName);
  }, [userId, userName]);
  
  // Create a new watch party
  const createWatchParty = useCallback(async (
    movieId: number | string, 
    movieTitle: string, 
    isPrivate: boolean = false
  ): Promise<WatchParty> => {
    setLoading(true);
    setError(null);
    
    try {
      const party = await watchPartyManager.createWatchParty(movieId, movieTitle, isPrivate);
      setCurrentParty(party);
      setMessages(party.messages);
      setPlaybackState(party.state);
      setIsConnected(true);
      setIsHost(true);
      setLoading(false);
      return party;
    } catch (err) {
      console.error('Error creating watch party:', err);
      setError('Failed to create watch party. Please try again later.');
      setLoading(false);
      throw err;
    }
  }, []);
  
  // Join an existing watch party
  const joinWatchParty = useCallback(async (
    partyId: string, 
    accessCode?: string
  ): Promise<WatchParty> => {
    setLoading(true);
    setError(null);
    
    try {
      const party = await watchPartyManager.joinWatchParty(partyId, accessCode);
      setCurrentParty(party);
      setMessages(party.messages);
      setPlaybackState(party.state);
      setIsConnected(true);
      setIsHost(party.hostId === userId);
      setLoading(false);
      return party;
    } catch (err) {
      console.error('Error joining watch party:', err);
      setError('Failed to join watch party. Please check the access code and try again.');
      setLoading(false);
      throw err;
    }
  }, [userId]);
  
  // Leave the current watch party
  const leaveWatchParty = useCallback(() => {
    watchPartyManager.leaveWatchParty();
    setCurrentParty(null);
    setMessages([]);
    setPlaybackState(null);
    setIsConnected(false);
    setIsHost(false);
  }, []);
  
  // Send a chat message to the current watch party
  const sendChatMessage = useCallback((content: string) => {
    if (!isConnected || !content.trim()) return;
    
    watchPartyManager.sendChatMessage(content);
    
    // Optimistically update the UI (the watch party manager will add it to the party)
    const party = watchPartyManager.getCurrentParty();
    if (party) {
      setMessages(party.messages);
    }
  }, [isConnected]);
  
  // Send a reaction GIF to the current watch party
  const sendReaction = useCallback((content: string, gifUrl: string) => {
    if (!isConnected || !gifUrl) return;
    
    watchPartyManager.sendReaction(content, gifUrl);
    
    // Optimistically update the UI
    const party = watchPartyManager.getCurrentParty();
    if (party) {
      setMessages(party.messages);
    }
  }, [isConnected]);
  
  // Update the playback state of the current watch party
  const updatePlaybackState = useCallback((currentTime: number, isPlaying: boolean) => {
    if (!isConnected) return;
    
    watchPartyManager.updatePlaybackState(currentTime, isPlaying);
    
    // Optimistically update the UI
    const party = watchPartyManager.getCurrentParty();
    if (party) {
      setPlaybackState(party.state);
    }
  }, [isConnected]);
  
  // Poll for party updates
  useEffect(() => {
    if (!isConnected) return;
    
    const intervalId = setInterval(() => {
      const party = watchPartyManager.getCurrentParty();
      if (party) {
        setCurrentParty(party);
        setMessages(party.messages);
        setPlaybackState(party.state);
      }
    }, 1000); // Poll every second
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isConnected]);
  
  return {
    currentParty,
    messages,
    playbackState,
    isConnected,
    isHost,
    error,
    loading,
    createWatchParty,
    joinWatchParty,
    leaveWatchParty,
    sendChatMessage,
    sendReaction,
    updatePlaybackState
  };
};

export default useWatchParty; 