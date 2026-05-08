import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { auth } from '../auth/auth';

interface CustomSocket extends Socket {
  userId?: string;
  userName?: string;
}

export function initSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket: CustomSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const session = await auth();
      if (!session?.user) {
        return next(new Error('Invalid session'));
      }
      socket.userId = session.user.id;
      socket.userName = session.user.name || 'Anonymous';
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: CustomSocket) => {
    console.log(`User ${socket.userName} connected`);

    socket.on('join-project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('user:join', {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('user:leave', {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on('file:change', ({ projectId, filePath, content }) => {
      socket.to(`project:${projectId}`).emit('file:update', {
        userId: socket.userId,
        filePath,
        content,
      });
    });

    socket.on('cursor:move', ({ projectId, filePath, position }) => {
      socket.to(`project:${projectId}`).emit('cursor:update', {
        userId: socket.userId,
        userName: socket.userName,
        filePath,
        position,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userName} disconnected`);
    });
  });

  return io;
}