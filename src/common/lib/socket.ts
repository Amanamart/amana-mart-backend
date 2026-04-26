import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

export let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust this in production to match CORS_ORIGINS
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Join room based on User ID (for private notifications)
    socket.on('join_user_room', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined their private room`);
    });

    // Join room for specific order updates
    socket.on('join_order_room', (orderId: string) => {
      socket.join(`order_${orderId}`);
      console.log(`📦 Socket joined room for order: ${orderId}`);
    });

    // Join room for chat
    socket.on('join_chat_room', (chatId: string) => {
      socket.join(`chat_${chatId}`);
      console.log(`💬 Socket joined chat room: ${chatId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper to emit events from anywhere in the backend
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

export const emitToOrder = (orderId: string, event: string, data: any) => {
  if (io) {
    io.to(`order_${orderId}`).emit(event, data);
  }
};
