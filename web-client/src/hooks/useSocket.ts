import { useEffect, useRef, useState } from 'react';
import { socketService } from '../services/SocketService';

export interface SocketStatus {
  isConnected: boolean;
  reconnectAttempts: number;
  socketId: string | null;
  error?: string;
}

/**
 * React hook for managing Socket.IO connection and events
 * Provides a clean interface for components to interact with real-time features
 */
export const useSocket = () => {
  const [status, setStatus] = useState<SocketStatus>({
    isConnected: false,
    reconnectAttempts: 0,
    socketId: null,
  });
  
  const listenersRef = useRef<Map<string, (...args: any[]) => void>>(new Map());
  
  useEffect(() => {
    // Update status when connection changes
    const handleConnected = () => {
      const connectionStatus = socketService.getConnectionStatus();
      setStatus({
        isConnected: true,
        reconnectAttempts: connectionStatus.reconnectAttempts,
        socketId: connectionStatus.socketId,
      });
    };
    
    const handleDisconnected = (reason: string) => {
      const connectionStatus = socketService.getConnectionStatus();
      setStatus({
        isConnected: false,
        reconnectAttempts: connectionStatus.reconnectAttempts,
        socketId: null,
        error: reason,
      });
    };
    
    const handleConnectionError = (error: Error) => {
      setStatus(prev => ({
        ...prev,
        error: error.message,
      }));
    };
    
    const handleMaxReconnectAttemptsReached = () => {
      setStatus(prev => ({
        ...prev,
        error: 'Maximum reconnection attempts reached',
      }));
    };
    
    // Subscribe to connection events
    socketService.on('connected', handleConnected);
    socketService.on('disconnected', handleDisconnected);
    socketService.on('connectionError', handleConnectionError);
    socketService.on('maxReconnectAttemptsReached', handleMaxReconnectAttemptsReached);
    
    // Initialize status
    const initialStatus = socketService.getConnectionStatus();
    setStatus({
      isConnected: initialStatus.isConnected,
      reconnectAttempts: initialStatus.reconnectAttempts,
      socketId: initialStatus.socketId,
    });
    
    return () => {
      socketService.off('connected', handleConnected);
      socketService.off('disconnected', handleDisconnected);
      socketService.off('connectionError', handleConnectionError);
      socketService.off('maxReconnectAttemptsReached', handleMaxReconnectAttemptsReached);
    };
  }, []);
  
  /**
   * Subscribe to a socket event with automatic cleanup
   */
  const on = (event: string, listener: (...args: any[]) => void) => {
    // Store listener for cleanup
    listenersRef.current.set(event, listener);
    socketService.on(event, listener);
  };
  
  /**
   * Unsubscribe from a socket event
   */
  const off = (event: string) => {
    const listener = listenersRef.current.get(event);
    if (listener) {
      socketService.off(event, listener);
      listenersRef.current.delete(event);
    }
  };
  
  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      listenersRef.current.forEach((listener, event) => {
        socketService.off(event, listener);
      });
      listenersRef.current.clear();
    };
  }, []);
  
  return {
    // Connection status
    status,
    
    // Event management
    on,
    off,
    
    // Authentication
    authenticate: (token: string) => socketService.authenticate(token),
    
    // Room management
    createRoom: (campaignId: string) => socketService.createRoom(campaignId),
    joinRoom: (roomId: string) => socketService.joinRoom(roomId),
    leaveRoom: (roomId: string) => socketService.leaveRoom(roomId),
    
    // Game actions
    moveUnit: (unitId: string, position: { x: number; y: number; z: number }) => 
      socketService.moveUnit(unitId, position),
    attackUnit: (attackerId: string, targetId: string) => 
      socketService.attackUnit(attackerId, targetId),
    endTurn: () => socketService.endTurn(),
    
    // Chat
    sendMessage: (message: string) => socketService.sendMessage(message),
    
    // Utility
    disconnect: () => socketService.disconnect(),
    getSocket: () => socketService.getSocket(),
  };
};