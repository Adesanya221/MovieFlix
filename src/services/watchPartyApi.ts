import { v4 as uuidv4 } from 'uuid';

// Types for watch party functionality
export interface WatchPartyParticipant {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  joinedAt: number;
}

export interface WatchPartyState {
  movieId: number | string;
  currentTime: number;
  isPlaying: boolean;
  lastUpdated: number;
}

export interface WatchPartyMessage {
  type: 'chat' | 'reaction' | 'system';
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  reactionGifUrl?: string;
}

export interface WatchParty {
  id: string;
  name: string;
  hostId: string;
  movieId: number | string;
  movieTitle: string;
  participants: WatchPartyParticipant[];
  state: WatchPartyState;
  messages: WatchPartyMessage[];
  createdAt: number;
  isPrivate: boolean;
  accessCode?: string;
}

// WebRTC connection configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:numb.viagenie.ca',
      username: 'webrtc@live.com',
      credential: 'muazkh'
    }
  ]
};

// Class to manage WebRTC peer connections
class WatchPartyConnection {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private participants: Map<string, RTCPeerConnection> = new Map();
  private onMessageCallback: ((data: any) => void) | null = null;
  private onParticipantJoinedCallback: ((participantId: string) => void) | null = null;
  private onParticipantLeftCallback: ((participantId: string) => void) | null = null;
  private onStateChangeCallback: ((state: WatchPartyState) => void) | null = null;
  
  constructor() {
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for WebRTC events
   */
  private setupEventListeners() {
    // Listen for ICE candidate events
    if (this.peerConnection) {
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real implementation, we would send this candidate to the other peer
          console.log('New ICE candidate:', event.candidate);
        }
      };
      
      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state changed:', this.peerConnection?.connectionState);
      };
      
      this.peerConnection.ondatachannel = (event) => {
        const receiveChannel = event.channel;
        this.setupDataChannel(receiveChannel);
      };
    }
  }
  
  /**
   * Set up the data channel for sending/receiving messages
   */
  private setupDataChannel(dataChannel: RTCDataChannel) {
    dataChannel.onopen = () => {
      console.log('Data channel is open');
    };
    
    dataChannel.onclose = () => {
      console.log('Data channel is closed');
    };
    
    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (this.onMessageCallback) {
          this.onMessageCallback(message);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    this.dataChannel = dataChannel;
  }
  
  /**
   * Initialize a new WebRTC connection as the host
   * @returns Promise that resolves when connection is ready
   */
  public async initializeAsHost(): Promise<void> {
    try {
      this.peerConnection = new RTCPeerConnection(ICE_SERVERS);
      this.dataChannel = this.peerConnection.createDataChannel('watchParty');
      this.setupDataChannel(this.dataChannel);
      this.setupEventListeners();
      
      // Create an offer to start the connection
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      console.log('Host initialized with offer:', offer);
      return Promise.resolve();
    } catch (error) {
      console.error('Error initializing as host:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Join an existing watch party as a participant
   * @param offer - The SDP offer from the host
   * @returns Promise that resolves with the answer SDP
   */
  public async joinAsParticipant(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    try {
      this.peerConnection = new RTCPeerConnection(ICE_SERVERS);
      this.setupEventListeners();
      
      // Set the remote description (the host's offer)
      await this.peerConnection.setRemoteDescription(offer);
      
      // Create an answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      console.log('Participant joined with answer:', answer);
      return answer;
    } catch (error) {
      console.error('Error joining as participant:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Send a message to all participants in the watch party
   * @param message - The message to send
   */
  public sendMessage(message: any): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    } else {
      console.error('Data channel is not open for sending messages');
    }
  }
  
  /**
   * Send a chat message to the watch party
   * @param senderId - ID of the sender
   * @param senderName - Name of the sender
   * @param content - Message content
   */
  public sendChatMessage(senderId: string, senderName: string, content: string): void {
    const message: WatchPartyMessage = {
      type: 'chat',
      senderId,
      senderName,
      content,
      timestamp: Date.now()
    };
    
    this.sendMessage(message);
  }
  
  /**
   * Send a reaction GIF to the watch party
   * @param senderId - ID of the sender
   * @param senderName - Name of the sender
   * @param content - Text description of the reaction
   * @param gifUrl - URL of the reaction GIF
   */
  public sendReaction(senderId: string, senderName: string, content: string, gifUrl: string): void {
    const message: WatchPartyMessage = {
      type: 'reaction',
      senderId,
      senderName,
      content,
      reactionGifUrl: gifUrl,
      timestamp: Date.now()
    };
    
    this.sendMessage(message);
  }
  
  /**
   * Update the watch party playback state (play/pause/seek)
   * @param movieId - ID of the movie being watched
   * @param currentTime - Current playback position in seconds
   * @param isPlaying - Whether the video is currently playing
   */
  public updatePlaybackState(movieId: number | string, currentTime: number, isPlaying: boolean): void {
    const state: WatchPartyState = {
      movieId,
      currentTime,
      isPlaying,
      lastUpdated: Date.now()
    };
    
    this.sendMessage({
      type: 'state_update',
      state
    });
    
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state);
    }
  }
  
  /**
   * Set callback for when a new message is received
   * @param callback - Function to call with the message data
   */
  public onMessage(callback: (data: any) => void): void {
    this.onMessageCallback = callback;
  }
  
  /**
   * Set callback for when a participant joins the watch party
   * @param callback - Function to call with the participant ID
   */
  public onParticipantJoined(callback: (participantId: string) => void): void {
    this.onParticipantJoinedCallback = callback;
  }
  
  /**
   * Set callback for when a participant leaves the watch party
   * @param callback - Function to call with the participant ID
   */
  public onParticipantLeft(callback: (participantId: string) => void): void {
    this.onParticipantLeftCallback = callback;
  }
  
  /**
   * Set callback for when the playback state changes
   * @param callback - Function to call with the new state
   */
  public onStateChange(callback: (state: WatchPartyState) => void): void {
    this.onStateChangeCallback = callback;
  }
  
  /**
   * Close all connections and clean up resources
   */
  public disconnect(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    
    this.participants.forEach((connection) => {
      connection.close();
    });
    
    this.participants.clear();
    this.localStream = null;
    this.remoteStream = null;
    
    console.log('Disconnected from watch party');
  }
}

// Class to manage watch parties
class WatchPartyManager {
  private static instance: WatchPartyManager;
  private activeParties: Map<string, WatchParty> = new Map();
  private connection: WatchPartyConnection | null = null;
  private currentPartyId: string | null = null;
  private userId: string | null = null;
  private userName: string | null = null;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  /**
   * Get the singleton instance of the WatchPartyManager
   */
  public static getInstance(): WatchPartyManager {
    if (!WatchPartyManager.instance) {
      WatchPartyManager.instance = new WatchPartyManager();
    }
    
    return WatchPartyManager.instance;
  }
  
  /**
   * Set the current user's info
   * @param userId - User's unique ID
   * @param userName - User's display name
   */
  public setUserInfo(userId: string, userName: string): void {
    this.userId = userId;
    this.userName = userName;
  }
  
  /**
   * Create a new watch party
   * @param movieId - ID of the movie to watch
   * @param movieTitle - Title of the movie
   * @param isPrivate - Whether the party is private (requires access code)
   * @returns The created WatchParty object
   */
  public async createWatchParty(
    movieId: number | string,
    movieTitle: string,
    isPrivate: boolean = false
  ): Promise<WatchParty> {
    if (!this.userId || !this.userName) {
      throw new Error('User info must be set before creating a watch party');
    }
    
    const partyId = uuidv4();
    const accessCode = isPrivate ? this.generateAccessCode() : undefined;
    
    const host: WatchPartyParticipant = {
      id: this.userId,
      name: this.userName,
      isHost: true,
      isConnected: true,
      joinedAt: Date.now()
    };
    
    const partyState: WatchPartyState = {
      movieId,
      currentTime: 0,
      isPlaying: false,
      lastUpdated: Date.now()
    };
    
    const party: WatchParty = {
      id: partyId,
      name: `${this.userName}'s Watch Party`,
      hostId: this.userId,
      movieId,
      movieTitle,
      participants: [host],
      state: partyState,
      messages: [],
      createdAt: Date.now(),
      isPrivate,
      accessCode
    };
    
    this.activeParties.set(partyId, party);
    this.currentPartyId = partyId;
    
    // Initialize WebRTC connection as host
    this.connection = new WatchPartyConnection();
    await this.connection.initializeAsHost();
    
    // Set up message handling
    this.setupMessageHandling();
    
    console.log('Created watch party:', party);
    return party;
  }
  
  /**
   * Join an existing watch party
   * @param partyId - ID of the party to join
   * @param accessCode - Access code for private parties
   * @returns The joined WatchParty object
   */
  public async joinWatchParty(partyId: string, accessCode?: string): Promise<WatchParty> {
    if (!this.userId || !this.userName) {
      throw new Error('User info must be set before joining a watch party');
    }
    
    const party = this.activeParties.get(partyId);
    
    if (!party) {
      throw new Error('Watch party not found');
    }
    
    if (party.isPrivate && party.accessCode !== accessCode) {
      throw new Error('Invalid access code');
    }
    
    // Create participant object
    const participant: WatchPartyParticipant = {
      id: this.userId,
      name: this.userName,
      isHost: false,
      isConnected: true,
      joinedAt: Date.now()
    };
    
    // Add participant to party
    party.participants.push(participant);
    this.currentPartyId = partyId;
    
    // Initialize WebRTC connection as participant
    // In a real implementation, we'd get the offer from the host
    // For demo purposes, we're creating a mock offer
    const mockOffer = { type: 'offer', sdp: 'mock offer sdp' } as RTCSessionDescriptionInit;
    
    this.connection = new WatchPartyConnection();
    await this.connection.joinAsParticipant(mockOffer);
    
    // Set up message handling
    this.setupMessageHandling();
    
    // Add a system message about the new participant
    this.addSystemMessage(party, `${this.userName} joined the watch party`);
    
    console.log('Joined watch party:', party);
    return party;
  }
  
  /**
   * Leave the current watch party
   */
  public leaveWatchParty(): void {
    if (!this.currentPartyId || !this.userId) {
      return;
    }
    
    const party = this.activeParties.get(this.currentPartyId);
    
    if (party) {
      // Remove participant from party
      const participantIndex = party.participants.findIndex(p => p.id === this.userId);
      
      if (participantIndex !== -1) {
        party.participants.splice(participantIndex, 1);
        
        // Add a system message about the participant leaving
        this.addSystemMessage(party, `${this.userName} left the watch party`);
        
        // If host leaves, either end the party or transfer host status
        if (party.hostId === this.userId) {
          if (party.participants.length > 0) {
            // Transfer host status to the next participant
            const newHost = party.participants[0];
            newHost.isHost = true;
            party.hostId = newHost.id;
            
            this.addSystemMessage(
              party, 
              `${this.userName} (host) left. ${newHost.name} is now the host.`
            );
          } else {
            // End the party if no participants remain
            this.activeParties.delete(this.currentPartyId);
          }
        }
      }
    }
    
    // Disconnect WebRTC
    if (this.connection) {
      this.connection.disconnect();
      this.connection = null;
    }
    
    this.currentPartyId = null;
    console.log('Left watch party');
  }
  
  /**
   * Get the current watch party if any
   * @returns The current WatchParty object or null
   */
  public getCurrentParty(): WatchParty | null {
    if (!this.currentPartyId) {
      return null;
    }
    
    return this.activeParties.get(this.currentPartyId) || null;
  }
  
  /**
   * Send a chat message to the current watch party
   * @param content - Message content
   */
  public sendChatMessage(content: string): void {
    if (!this.connection || !this.userId || !this.userName || !this.currentPartyId) {
      console.error('Cannot send message: Not connected to a watch party');
      return;
    }
    
    const party = this.activeParties.get(this.currentPartyId);
    
    if (!party) {
      console.error('Watch party not found');
      return;
    }
    
    // Create and add the message
    const message: WatchPartyMessage = {
      type: 'chat',
      senderId: this.userId,
      senderName: this.userName,
      content,
      timestamp: Date.now()
    };
    
    party.messages.push(message);
    
    // Send via WebRTC
    this.connection.sendChatMessage(this.userId, this.userName, content);
  }
  
  /**
   * Send a reaction GIF to the current watch party
   * @param content - Text description of the reaction
   * @param gifUrl - URL of the reaction GIF
   */
  public sendReaction(content: string, gifUrl: string): void {
    if (!this.connection || !this.userId || !this.userName || !this.currentPartyId) {
      console.error('Cannot send reaction: Not connected to a watch party');
      return;
    }
    
    const party = this.activeParties.get(this.currentPartyId);
    
    if (!party) {
      console.error('Watch party not found');
      return;
    }
    
    // Create and add the message
    const message: WatchPartyMessage = {
      type: 'reaction',
      senderId: this.userId,
      senderName: this.userName,
      content,
      reactionGifUrl: gifUrl,
      timestamp: Date.now()
    };
    
    party.messages.push(message);
    
    // Send via WebRTC
    this.connection.sendReaction(this.userId, this.userName, content, gifUrl);
  }
  
  /**
   * Update the playback state of the current watch party
   * @param currentTime - Current playback position in seconds
   * @param isPlaying - Whether the video is currently playing
   */
  public updatePlaybackState(currentTime: number, isPlaying: boolean): void {
    if (!this.connection || !this.currentPartyId) {
      console.error('Cannot update playback: Not connected to a watch party');
      return;
    }
    
    const party = this.activeParties.get(this.currentPartyId);
    
    if (!party) {
      console.error('Watch party not found');
      return;
    }
    
    // Update local state
    party.state = {
      ...party.state,
      currentTime,
      isPlaying,
      lastUpdated: Date.now()
    };
    
    // Send update via WebRTC
    this.connection.updatePlaybackState(party.movieId, currentTime, isPlaying);
  }
  
  /**
   * Get all active watch parties
   * @returns Array of all active watch parties
   */
  public getActiveParties(): WatchParty[] {
    return Array.from(this.activeParties.values());
  }
  
  /**
   * Get the connection status
   * @returns Whether connected to a watch party
   */
  public isConnected(): boolean {
    return this.connection !== null && this.currentPartyId !== null;
  }
  
  /**
   * Set up handlers for incoming WebRTC messages
   */
  private setupMessageHandling(): void {
    if (!this.connection) return;
    
    this.connection.onMessage((data) => {
      if (!this.currentPartyId) return;
      
      const party = this.activeParties.get(this.currentPartyId);
      if (!party) return;
      
      if (data.type === 'chat' || data.type === 'reaction') {
        // Add the message to the party
        party.messages.push(data as WatchPartyMessage);
        console.log('Received message:', data);
      } else if (data.type === 'state_update') {
        // Update playback state
        party.state = data.state;
        console.log('Received state update:', data.state);
      }
    });
    
    this.connection.onParticipantJoined((participantId) => {
      console.log('Participant joined:', participantId);
    });
    
    this.connection.onParticipantLeft((participantId) => {
      console.log('Participant left:', participantId);
    });
    
    this.connection.onStateChange((state) => {
      if (this.currentPartyId) {
        const party = this.activeParties.get(this.currentPartyId);
        if (party) {
          party.state = state;
        }
      }
    });
  }
  
  /**
   * Add a system message to a watch party
   * @param party - The watch party to add the message to
   * @param content - Message content
   */
  private addSystemMessage(party: WatchParty, content: string): void {
    const message: WatchPartyMessage = {
      type: 'system',
      senderId: 'system',
      senderName: 'System',
      content,
      timestamp: Date.now()
    };
    
    party.messages.push(message);
  }
  
  /**
   * Generate a random access code for private watch parties
   * @returns A 6-character access code
   */
  private generateAccessCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    
    return code;
  }
}

// Export the singleton instance
export const watchPartyManager = WatchPartyManager.getInstance();

export default watchPartyManager; 