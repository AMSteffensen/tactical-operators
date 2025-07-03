import { Server as SocketIOServer, Socket } from 'socket.io';
import { GAME_EVENTS } from '@shared/constants';

export const setupSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle room joining
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      socket.to(roomId).emit('user_joined', { userId: socket.id });
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle room leaving
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user_left', { userId: socket.id });
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    // Handle game events
    socket.on('game_action', (data) => {
      const { roomId, action, payload } = data;
      socket.to(roomId).emit('game_action', { userId: socket.id, action, payload });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
