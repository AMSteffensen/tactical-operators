import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { GAME_EVENTS } from '../../../shared/dist/constants/index.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  currentRoom?: string;
}

interface GameRoom {
  id: string;
  players: Set<string>;
  gameState: any;
  currentTurn?: string;
}

// In-memory game rooms (in production, this would be in Redis or database)
const gameRooms = new Map<string, GameRoom>();

export const setupSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: AuthenticatedSocket) => {

    // Authentication handler
    socket.on('authenticate', async (token: string) => {
      try {
        if (!token) {
          socket.emit('authenticationFailed', { error: 'No token provided' });
          socket.disconnect();
          return;
        }

        // Validate JWT token and extract user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        socket.userId = decoded.id;
        socket.emit('authenticated', { userId: socket.userId });
      } catch (error) {
        socket.emit('authenticationFailed', { error: 'Invalid token' });
        socket.disconnect();
      }
    });

    // Helper function to check authentication
    const requireAuth = (callback: Function) => {
      if (!socket.userId) {
        socket.emit('error', 'Authentication required');
        return false;
      }
      return true;
    };

    // Room management handlers
    socket.on('createRoom', (campaignId: string) => {
      if (!requireAuth(() => {})) return;

      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const room: GameRoom = {
        id: roomId,
        players: new Set([socket.userId!]),
        gameState: {
          units: {},
          turn: socket.userId,
          phase: 'setup'
        }
      };
      
      gameRooms.set(roomId, room);
      socket.join(roomId);
      socket.currentRoom = roomId;
      
      socket.emit('roomCreated', roomId);
    });

    socket.on('joinRoom', (roomId: string) => {
      if (!requireAuth(() => {})) return;

      const room = gameRooms.get(roomId);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      socket.join(roomId);
      socket.currentRoom = roomId;
      room.players.add(socket.userId!);

      // Notify others in the room
      socket.to(roomId).emit('playerJoined', { 
        playerId: socket.userId,
        userId: socket.userId 
      });
      
      // Send current game state to new player
      socket.emit('gameStateUpdate', room.gameState);
      
      // Send room info
      socket.emit('roomJoined', roomId, Array.from(room.players));
    });

    socket.on('leaveRoom', (roomId: string) => {
      const room = gameRooms.get(roomId);
      if (room) {
        room.players.delete(socket.id);
        socket.leave(roomId);
        socket.currentRoom = undefined;
        
        socket.to(roomId).emit('playerLeft', socket.id);
        
        // Clean up empty rooms
        if (room.players.size === 0) {
          gameRooms.delete(roomId);
        }
      }
    });

    // Game action handlers
    socket.on('moveUnit', (unitId: string, position: { x: number; y: number; z: number }) => {
      if (!socket.currentRoom) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const room = gameRooms.get(socket.currentRoom);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      // TODO: Validate move is legal and it's player's turn
      
      // Update game state
      if (!room.gameState.units[unitId]) {
        room.gameState.units[unitId] = {};
      }
      room.gameState.units[unitId].position = position;
      room.gameState.units[unitId].lastMoved = Date.now();
      room.gameState.units[unitId].movedBy = socket.id;

      // Broadcast to all players in room
      socket.to(socket.currentRoom).emit('unitMoved', unitId, position);
      
      // Send updated game state
      io.to(socket.currentRoom).emit('gameStateUpdate', room.gameState);
    });

    socket.on('attackUnit', (attackerId: string, targetId: string) => {
      if (!socket.currentRoom) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const room = gameRooms.get(socket.currentRoom);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      // TODO: Calculate damage, validate attack
      const damage = Math.floor(Math.random() * 20) + 1; // Random damage for demo
      
      // Broadcast attack to all players
      io.to(socket.currentRoom).emit('unitAttacked', attackerId, targetId, damage);
    });

    socket.on('endTurn', () => {
      if (!socket.currentRoom) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const room = gameRooms.get(socket.currentRoom);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      if (room.currentTurn !== socket.id) {
        socket.emit('error', 'Not your turn');
        return;
      }

      // Simple turn rotation (in a real game, this would be more sophisticated)
      const players = Array.from(room.players);
      const currentIndex = players.indexOf(socket.id);
      const nextIndex = (currentIndex + 1) % players.length;
      room.currentTurn = players[nextIndex];

      // Notify all players
      io.to(socket.currentRoom).emit('turnEnded', socket.id);
      io.to(socket.currentRoom).emit('turnStarted', room.currentTurn);
    });

    // Chat handler
    socket.on('sendMessage', (message: string) => {
      if (!socket.currentRoom) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const timestamp = Date.now();
      
      // Broadcast message to all players in room
      io.to(socket.currentRoom).emit('message', socket.id, message, timestamp);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      
      if (socket.currentRoom) {
        const room = gameRooms.get(socket.currentRoom);
        if (room) {
          room.players.delete(socket.id);
          socket.to(socket.currentRoom).emit('playerLeft', socket.id);
          
          // Clean up empty rooms
          if (room.players.size === 0) {
            gameRooms.delete(socket.currentRoom);
          }
        }
      }
    });

    // Send initial connection confirmation
    socket.emit('connected');
  });
};
