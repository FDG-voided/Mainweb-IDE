import { Request } from 'express';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface AuthOptions {
  requireAuth?: boolean;
}