import { io, Socket } from 'socket.io-client';

// Define event types for type safety
export interface ServerToClientEvents {
  // Game state events
  gameStateUpdate: (state: any) => void;
  playerJoined: (player: any) => void;
  playerLeft: (playerId: string) => void;
  
  // Unit/Character events
  unitMoved: (unitId: string, position: { x: number; y: number; z: number }) => void;
  unitAttacked: (attacker: string, target: string, damage: number) => void;
  unitDestroyed: (unitId: string) => void;
  
  // Turn-based events
  turnStarted: (playerId: string) => void;
  turnEnded: (playerId: string) => void;
  
  // Room/Campaign events
  roomCreated: (roomId: string) => void;
  roomJoined: (roomId: string, players: any[]) => void;
  roomLeft: (roomId: string) => void;
  
  // Chat events
  message: (from: string, message: string, timestamp: number) => void;
  
  // Error events
  error: (message: string) => void;
  disconnect: () => void;
}

export interface ClientToServerEvents {
  // Authentication
  authenticate: (token: string) => void;
  
  // Room management
  createRoom: (campaignId: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  
  // Game actions
  moveUnit: (unitId: string, position: { x: number; y: number; z: number }) => void;
  attackUnit: (attackerId: string, targetId: string) => void;
  endTurn: () => void;
  
  // Chat
  sendMessage: (message: string) => void;
}

/**
 * Socket.IO service for real-time communication with the game server
 * Handles connection, authentication, and game state synchronization
 */
export class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private isConnected = false;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor() {
    this.connect();
  }
  
  /**
   * Connect to the Socket.IO server
   */
  private connect() {
    const socketUrl = (import.meta as any).env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    console.log('🔌 Connecting to Socket.IO server:', socketUrl);
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      retries: 3,
    });
    
    this.setupEventHandlers();
  }
  
  /**
   * Set up core Socket.IO event handlers
   */
  private setupEventHandlers() {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to game server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from game server:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
      
      // Auto-reconnect logic
      if (reason === 'io server disconnect') {
        // Server disconnected us, don't auto-reconnect
        return;
      }
      
      this.handleReconnection();
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      this.emit('connectionError', error);
    });
    
    // Game-specific event handlers
    this.socket.on('gameStateUpdate', (state) => {
      this.emit('gameStateUpdate', state);
    });
    
    this.socket.on('playerJoined', (player) => {
      console.log('👤 Player joined:', player);
      this.emit('playerJoined', player);
    });
    
    this.socket.on('playerLeft', (playerId) => {
      console.log('👤 Player left:', playerId);
      this.emit('playerLeft', playerId);
    });
    
    this.socket.on('unitMoved', (unitId, position) => {
      this.emit('unitMoved', unitId, position);
    });
    
    this.socket.on('unitAttacked', (attacker, target, damage) => {
      this.emit('unitAttacked', attacker, target, damage);
    });
    
    this.socket.on('turnStarted', (playerId) => {
      console.log('🎯 Turn started for player:', playerId);
      this.emit('turnStarted', playerId);
    });
    
    this.socket.on('turnEnded', (playerId) => {
      console.log('⏰ Turn ended for player:', playerId);
      this.emit('turnEnded', playerId);
    });
    
    this.socket.on('message', (from, message, timestamp) => {
      this.emit('chatMessage', from, message, timestamp);
    });
    
    this.socket.on('error', (message) => {
      console.error('🚨 Server error:', message);
      this.emit('serverError', message);
    });
  }
  
  /**
   * Handle reconnection attempts
   */
  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }
  
  /**
   * Authenticate with the server
   */
  authenticate(token: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('authenticate', token);
    }
  }
  
  /**
   * Room management methods
   */
  createRoom(campaignId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('createRoom', campaignId);
    }
  }
  
  joinRoom(roomId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinRoom', roomId);
    }
  }
  
  leaveRoom(roomId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveRoom', roomId);
    }
  }
  
  /**
   * Game action methods
   */
  moveUnit(unitId: string, position: { x: number; y: number; z: number }) {
    if (this.socket && this.isConnected) {
      this.socket.emit('moveUnit', unitId, position);
    }
  }
  
  attackUnit(attackerId: string, targetId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('attackUnit', attackerId, targetId);
    }
  }
  
  endTurn() {
    if (this.socket && this.isConnected) {
      this.socket.emit('endTurn');
    }
  }
  
  /**
   * Chat methods
   */
  sendMessage(message: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('sendMessage', message);
    }
  }
  
  /**
   * Event listener management
   */
  on(event: string, listener: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }
  
  off(event: string, listener: (...args: any[]) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }
  
  private emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null,
    };
  }
  
  /**
   * Disconnect from the server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
  
  /**
   * Get the raw socket instance for advanced operations
   */
  getSocket() {
    return this.socket;
  }
}

// Export a singleton instance
export const socketService = new SocketService();