import { Server as SocketIOServer, Socket } from 'socket.io';
import { GAME_EVENTS } from '@shared/constants';

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
    console.log(`🔌 User connected: ${socket.id}`);

    // Authentication handler
    socket.on('authenticate', (token: string) => {
      // TODO: Validate JWT token and extract user ID
      socket.userId = socket.id; // Temporary: use socket ID as user ID
      console.log(`🔐 User authenticated: ${socket.userId}`);
      socket.emit('authenticated', { userId: socket.userId });
    });

    // Room management handlers
    socket.on('createRoom', (campaignId: string) => {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const room: GameRoom = {
        id: roomId,
        players: new Set([socket.id]),
        gameState: {
          units: {},
          turn: socket.id,
          phase: 'setup'
        }
      };
      
      gameRooms.set(roomId, room);
      socket.join(roomId);
      socket.currentRoom = roomId;
      
      console.log(`🏠 Room created: ${roomId} by ${socket.id}`);
      socket.emit('roomCreated', roomId);
    });

    socket.on('joinRoom', (roomId: string) => {
      const room = gameRooms.get(roomId);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      socket.join(roomId);
      socket.currentRoom = roomId;
      room.players.add(socket.id);

      console.log(`👥 User ${socket.id} joined room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('playerJoined', { 
        playerId: socket.id,
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
        
        console.log(`👋 User ${socket.id} left room ${roomId}`);
        socket.to(roomId).emit('playerLeft', socket.id);
        
        // Clean up empty rooms
        if (room.players.size === 0) {
          gameRooms.delete(roomId);
          console.log(`🗑️ Empty room deleted: ${roomId}`);
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

      console.log(`🎮 Unit ${unitId} moved by ${socket.id} to`, position);
      
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
      
      console.log(`⚔️ Unit ${attackerId} attacks ${targetId} for ${damage} damage`);
      
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

      console.log(`🔄 Turn ended by ${socket.id}, next turn: ${room.currentTurn}`);
      
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
      console.log(`💬 Message from ${socket.id}: ${message}`);
      
      // Broadcast message to all players in room
      io.to(socket.currentRoom).emit('message', socket.id, message, timestamp);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      
      if (socket.currentRoom) {
        const room = gameRooms.get(socket.currentRoom);
        if (room) {
          room.players.delete(socket.id);
          socket.to(socket.currentRoom).emit('playerLeft', socket.id);
          
          // Clean up empty rooms
          if (room.players.size === 0) {
            gameRooms.delete(socket.currentRoom);
            console.log(`🗑️ Empty room deleted: ${socket.currentRoom}`);
          }
        }
      }
    });

    // Send initial connection confirmation
    socket.emit('connected');
  });
};
