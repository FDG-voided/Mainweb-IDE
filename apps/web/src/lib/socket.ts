import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(token?: string): Socket {
  if (!socket) {
    socket = io({
      auth: { token },
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(token?: string) {
  const s = getSocket(token);
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export interface CursorPosition {
  lineNumber: number;
  column: number;
}

export interface FileUpdate {
  userId: string;
  filePath: string;
  content: string;
}

export interface CursorUpdate {
  userId: string;
  userName: string;
  filePath: string;
  position: CursorPosition;
}

export interface UserPresence {
  userId: string;
  userName: string;
}